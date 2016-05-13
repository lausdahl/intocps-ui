///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />


import * as Collections from 'typescript-collections';
import * as Fmi from "../coe/fmi";

import {MultiModelConfig} from "./MultiModelConfig";

import Path = require('path');

export class Parser {

    protected FMUS_TAG: string = "fmus";
    protected CONNECTIONS_TAG: string = "connections";
    protected PARAMETERS_TAG: string = "parameters";
    protected LIVESTREAM_TAG: string = "livestream";

    //Parse fmus json tag
    parseFmus(data: any, basePath: string): Promise<Fmi.Fmu[]> {

        var fmus: Fmi.Fmu[] = [];

        var populates: Promise<void>[] = [];

        if (Object.keys(data).indexOf(this.FMUS_TAG) >= 0) {
            $.each(Object.keys(data[this.FMUS_TAG]), (j, key) => {
                var description = "";
                var path = data[this.FMUS_TAG][key];

                let fmu = new Fmi.Fmu(key, Path.normalize(basePath + "/" + path));
                populates.push(fmu.populate());
                fmus.push(fmu);
            });
        }

        return new Promise<Fmi.Fmu[]>(function (resolve, reject) {

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



    //parse livestream
    parseLivestream(data: any): Map<String, Collections.LinkedList<String>> {
        var livestream: Map<String, Collections.LinkedList<String>> = new Map<String, Collections.LinkedList<String>>();

        if (Object.keys(data).indexOf(this.LIVESTREAM_TAG) >= 0) {
            let livestreamEntry = data[this.LIVESTREAM_TAG];
            $.each(Object.keys(livestreamEntry), (j, outputKey) => {
                let inputList = livestreamEntry[outputKey];

                var inputs: Collections.LinkedList<String> = new Collections.LinkedList<String>();
                $.each(inputList, function (j, input) {
                    inputs.add(input);
                });

                livestream.set(outputKey, inputs);
            });
        }


        return livestream;
    }




}