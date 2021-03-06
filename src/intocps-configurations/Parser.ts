///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />


import * as Collections from 'typescript-collections';
import * as Fmi from "../coe/fmi";

import {MultiModelConfig} from "./MultiModelConfig";
import {CoSimulationConfig, ICoSimAlgorithm, FixedStepAlgorithm, VariableStepAlgorithm, VarStepConstraint, VarStepConstraintType} from "./CoSimulationConfig";

import Path = require('path');

export class Parser {

    protected FMUS_TAG: string = "fmus";
    protected CONNECTIONS_TAG: string = "connections";
    protected PARAMETERS_TAG: string = "parameters";
    protected LIVESTREAM_TAG: string = "livestream";
    protected START_TIME_TAG: string = "startTime";
    protected END_TIME_TAG: string = "endTime";
    protected ALGORITHM_TAG: string = "algorithm";
    protected MULTIMODEL_PATH_TAG: string = "multimodel_path";

    protected ALGORITHM_TYPE: string = "type";
    protected ALGORITHM_TYPE_FIXED: string = "fixed-step";
    protected ALGORITHM_TYPE_VAR: string = "var-step";

    protected ALGORITHM_TYPE_FIXED_SIZE_TAG: string = "size";

    protected ALGORITHM_TYPE_VAR_INIT_SIZE_TAG: string = "initsize";
    protected ALGORITHM_TYPE_VAR_SIZE_TAG: string = "size";
    protected ALGORITHM_TYPE_VAR_CONSTRAINTS_TAG: string = "constraints";

    constructor() { }

    //Parse fmus json tag
    parseFmus(data: any, basePath: string): Promise<Fmi.Fmu[]> {

        var fmus: Fmi.Fmu[] = [];

        return new Promise<Fmi.Fmu[]>((resolve, reject) => {

            var populates: Promise<void>[] = [];
            try {
                if (Object.keys(data).indexOf(this.FMUS_TAG) >= 0) {
                    $.each(Object.keys(data[this.FMUS_TAG]), (j, key) => {
                        var description = "";
                        var path = data[this.FMUS_TAG][key];

                        let fmu = new Fmi.Fmu(key, Path.normalize(basePath + "/" + path));
                        populates.push(fmu.populate());
                        fmus.push(fmu);
                    });
                }
            } catch (e) {
                reject(e);
            }

            Promise.all(populates.map(p => p.catch(e => e)))
                .then(results => resolve(fmus))
                .catch(e => reject(e));
        });
    }


    parseId(id: string): string[] {
        //is must have the form: '{' + fmuName '}' + '.' instance-name + '.' + scalar-variable
        // restriction is that instance-name cannot have '.'

        let indexEndCurlyBracket = id.indexOf('}');
        if (indexEndCurlyBracket <= 0) {
            throw "Invalid id";
        }

        let fmuName = id.substring(0, indexEndCurlyBracket + 1);
        var rest = id.substring(indexEndCurlyBracket + 1);
        var dotIndex = rest.indexOf('.');
        if (dotIndex < 0) {
            throw "Missing dot after fmu name";
        }
        rest = rest.substring(dotIndex + 1);
        //this is instance-name start index 0

        dotIndex = rest.indexOf('.');
        if (dotIndex < 0) {
            throw "Missing dot after instance name";
        }
        let instanceName = rest.substring(0, dotIndex);
        let scalarVariableName = rest.substring(dotIndex + 1);

        return [fmuName, instanceName, scalarVariableName];
    }

    parseIdShort(id: string): string[] {
        //is must have the form: '{' + fmuName '}' + '.' instance-name 
        // restriction is that instance-name cannot have '.'

        let indexEndCurlyBracket = id.indexOf('}');
        if (indexEndCurlyBracket <= 0) {
            throw "Invalid id";
        }

        let fmuName = id.substring(0, indexEndCurlyBracket + 1);
        var rest = id.substring(indexEndCurlyBracket + 1);
        var dotIndex = rest.indexOf('.');
        if (dotIndex < 0) {
            throw "Missing dot after fmu name";
        }
        rest = rest.substring(dotIndex + 1);
        //this is instance-name start index 0

        let instanceName = rest;
        return [fmuName, instanceName];
    }

    //Utility method to obtain an instance from the multimodel by its string id encoding
    private getInstance(multiModel: MultiModelConfig, id: string): Fmi.Instance {
        let ids = this.parseId(id);

        let fmuName = ids[0];
        let instanceName = ids[1];
        let scalarVariableName = ids[2];

        return multiModel.getInstanceOrCreate(fmuName, instanceName);
    }

    //parse connections
    parseConnections(data: any, multiModel: MultiModelConfig) {

        if (Object.keys(data).indexOf(this.CONNECTIONS_TAG) >= 0) {
            let connectionsEntry = data[this.CONNECTIONS_TAG];
            $.each(Object.keys(connectionsEntry), (j, id) => {

                let ids = this.parseId(id);

                let fmuName = ids[0];
                let instanceName = ids[1];
                let scalarVariableName = ids[2];

                var instance = this.getInstance(multiModel, id);

                let inputList = connectionsEntry[id];

                $.each(inputList, (j, inputId) => {
                    let inputIds = this.parseId(inputId);

                    let inFmuName = inputIds[0];
                    let inInstanceName = inputIds[1];
                    let inScalarVariableName = inputIds[2];

                    var inInstance = multiModel.getInstanceOrCreate(inFmuName, inInstanceName);

                    instance.addOutputToInputLink(instance.fmu.getScalarVariable(scalarVariableName),
                        new Fmi.InstanceScalarPair(inInstance, inInstance.fmu.getScalarVariable(inScalarVariableName)));
                });
            });
        }
    }



    //parse parameters
    parseParameters(data: any, multiModel: MultiModelConfig) {
        var parameters: Map<String, any> = new Map<String, any>();

        if (Object.keys(data).indexOf(this.PARAMETERS_TAG) >= 0) {
            let parameterData = data[this.PARAMETERS_TAG];
            $.each(Object.keys(parameterData), (j, id) => {
                let value = parameterData[id];

                let ids = this.parseId(id);

                let fmuName = ids[0];
                let instanceName = ids[1];
                let scalarVariableName = ids[2];

                var instance = this.getInstance(multiModel, id);
                instance.initialValues.set(instance.fmu.getScalarVariable(scalarVariableName), value);
            });
        }

        return parameters;
    }


    parseSimpleTag(data: any, tag: string): any {
        var value: any = null;

        if (Object.keys(data).indexOf(tag) >= 0) {
            value = data[tag];

        }

        return value;
    }

    //parse startTime
    parseStartTime(data: any): number {
        return this.parseSimpleTag(data, this.START_TIME_TAG);
    }

    //parse endtime
    parseEndTime(data: any): number {
        return this.parseSimpleTag(data, this.END_TIME_TAG);
    }

    parseMultiModelPath(data: any, projectRoot: string): string {
        return Path.normalize(projectRoot + "/" + this.parseSimpleTag(data, this.MULTIMODEL_PATH_TAG));
    }



    //parse livestream
    parseLivestream(data: any, multiModel: MultiModelConfig): Map<Fmi.Instance, Fmi.ScalarVariable[]> {

        var livestream: Map<Fmi.Instance, Fmi.ScalarVariable[]> = new Map<Fmi.Instance, Fmi.ScalarVariable[]>();


        if (Object.keys(data).indexOf(this.LIVESTREAM_TAG) >= 0) {
            let livestreamEntry = data[this.LIVESTREAM_TAG];
            $.each(Object.keys(livestreamEntry), (j, id) => {

                let ids = this.parseIdShort(id);

                let fmuName = ids[0];
                let instanceName = ids[1];

                let instance: Fmi.Instance = multiModel.getInstanceOrCreate(fmuName, instanceName);

                let outputs = livestreamEntry[id];

                var enabledScalars: Fmi.ScalarVariable[] = [];
                $.each(outputs, (j, input) => {
                    enabledScalars.push(instance.fmu.getScalarVariable(input));
                });

                livestream.set(instance, enabledScalars);
            });
        }


        return livestream;
    }


    parseAlgorithm(data: any): ICoSimAlgorithm {
        if (Object.keys(data).indexOf(this.ALGORITHM_TAG) >= 0) {
            let algorithm = data[this.ALGORITHM_TAG];

            var isFixed: boolean = true;

            if (Object.keys(algorithm).indexOf(this.ALGORITHM_TYPE) >= 0) {
                let algorithmType = algorithm[this.ALGORITHM_TYPE];

                if (algorithmType.indexOf(this.ALGORITHM_TYPE_VAR) == 0) {
                    isFixed = false;

                }

            }

            //now type is detected so parse import 

            if (isFixed) {
                return this.parseAlgorithmFixed(algorithm);
            } else {
                return this.parseAlgorithmVar(algorithm);
            }

        }
    }

    private parseAlgorithmFixed(data: any): ICoSimAlgorithm {
        return new FixedStepAlgorithm(this.parseSimpleTag(data, this.ALGORITHM_TYPE_FIXED_SIZE_TAG));
    }

    private parseAlgorithmVar(data: any): ICoSimAlgorithm {
        let algorithm = new VariableStepAlgorithm();

        algorithm.initSize = this.parseSimpleTag(data, this.ALGORITHM_TYPE_VAR_INIT_SIZE_TAG);
        let sizes = this.parseSimpleTag(data, this.ALGORITHM_TYPE_VAR_SIZE_TAG);
        algorithm.sizeMin = sizes[0];
        algorithm.sizeMax = sizes[1];
        algorithm.constraints = this.parseAlgorithmVarConstraints(data);

        return algorithm;
    }

    private parseAlgorithmVarConstraints(data: any): VarStepConstraint[] {
        return [];//TODO
    }

}



/*
 This is the Serializer class. It is placed here after the Parser which is the super class. See: http://stackoverflow.com/questions/24420500/typescript-error-runtime-error-cannot-read-property-prototype-of-undefined-wh data
 https://github.com/Microsoft/TypeScript/issues/5207 for more information
*/


export class Serializer extends Parser {

    constructor() {
        super();
    }

    public toObjectMultiModel(multiModel: MultiModelConfig, fmusRootPath: string): any {
        var obj: any = new Object();
        //fmus
        obj[this.FMUS_TAG] = this.toObjectFmus(multiModel.fmus, fmusRootPath);
        //connections
        obj[this.CONNECTIONS_TAG] = this.toObjectConnections(multiModel.fmuInstances);
        //parameters
        obj[this.PARAMETERS_TAG] = this.toObjectParameters(multiModel.fmuInstances);

        return obj;
    }

    public toObjectCoSimulationConfig(cc: CoSimulationConfig, projectRoot: string): any {
        var obj: any = new Object();


        var path = cc.multiModel.sourcePath;
        if (path.indexOf(projectRoot) >= 0) {
            path = path.substring(projectRoot.length + 1);
        }

        //multimodel source
        obj[this.MULTIMODEL_PATH_TAG] = path;

        //parameters
        // obj[this.PARAMETERS_TAG] = this.toObjectParameters(cc.fmuInstances);

        //start time
        obj[this.START_TIME_TAG] = cc.startTime;
        //end time
        obj[this.END_TIME_TAG] = cc.endTime;

        //livestream
        obj[this.LIVESTREAM_TAG] = this.toObjectLivestream(cc.livestream);

        //algorithm
        obj[this.ALGORITHM_TAG] = this.toObjectAlgorithm(cc.algorithm);

        return obj;
    }

    //convert fmus to JSON
    private toObjectFmus(fmus: Fmi.Fmu[], fmusRootPath: string): any {
        var data: any = new Object();

        fmus.forEach((fmu: Fmi.Fmu) => {

            var path = fmu.path;
            if (path.indexOf(fmusRootPath) >= 0) {
                path = path.substring(fmusRootPath.length + 1);
            }

            data[fmu.name] = path;
        });


        return data;
    }

    //util method to obtain id from instance
    public static getId(value: Fmi.Instance): string {
        return value.fmu.name + "." + value.name;
    }

    //util method to obtain full id from instance and scalarvariable
    public static getIdSv(value: Fmi.Instance, sv: Fmi.ScalarVariable): string {
        return value.fmu.name + "." + value.name + "." + sv.name;
    }

    //toObjectConnections
    toObjectConnections(fmuInstances: Fmi.Instance[]): any {
        var cons: any = new Object();

        fmuInstances.forEach(value => {
            value.outputsTo.forEach((pairs, sv) => {
                let key = Serializer.getIdSv(value, sv);
                var inputs: any[] = [];
                pairs.forEach(pair => {
                    let input = Serializer.getIdSv(pair.instance, pair.scalarVariable);
                    inputs.push(input);
                });

                cons[key] = inputs;
            });
        });

        return cons;
    }


    //to JSON parameters
    toObjectParameters(fmuInstances: Fmi.Instance[]): any {
        var obj: any = new Object();

        fmuInstances.forEach(instance => {
            instance.initialValues.forEach((value, sv) => {
                obj[Serializer.getIdSv(instance, sv)] = value;
            });
        });

        return obj;
    }


    toObjectLivestream(livestream: Map<Fmi.Instance, Fmi.ScalarVariable[]>): any {
        var obj: any = new Object();

        livestream.forEach((svs, instance) => {

            var inputs: any[] = [];
            svs.forEach(sv => {
                inputs.push(sv.name);
            });
            obj[Serializer.getId(instance)] = inputs;
        });

        return obj;
    }

    toObjectAlgorithm(algorithm: ICoSimAlgorithm): any {
        if (algorithm instanceof FixedStepAlgorithm) {
            var obj: any = new Object();
            obj[this.ALGORITHM_TYPE] = this.ALGORITHM_TYPE_FIXED;
            obj[this.ALGORITHM_TYPE_FIXED_SIZE_TAG] = algorithm.size;
            return obj;
        }else if (algorithm instanceof VariableStepAlgorithm)
        {
             var obj: any = new Object();
            obj[this.ALGORITHM_TYPE] = this.ALGORITHM_TYPE_VAR;
            obj[this.ALGORITHM_TYPE_VAR_INIT_SIZE_TAG] = algorithm.initSize;
            obj[this.ALGORITHM_TYPE_VAR_SIZE_TAG] = [algorithm.sizeMin,algorithm.sizeMax];
            obj[this.ALGORITHM_TYPE_VAR_CONSTRAINTS_TAG] = [];//TODO
            return obj;
        }

        return null;
    }
}