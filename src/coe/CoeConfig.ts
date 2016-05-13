//TODO: DUMMY REFERENCE UNTIL CHART MAKES A TYPESCRIPT DEFINITION FILE!
///<reference path="Chart.d.ts"/>
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />

import * as Main from  "../settings/settings"
import * as IntoCpsApp from  "../IntoCpsApp"
import {IntoCpsAppEvents} from "../IntoCpsAppEvents";
import Path = require('path');

import * as Collections from 'typescript-collections';

import * as Fmi from "./fmi";

import * as Configs from "../intocps-configurations/intocps-configurations";

export class FmuInfo {
    description: string = "";
    path: string = null;

    constructor(description: string, path: string) {
        this.description = description;
        this.path = path;
    }
}






class DomParser {

    private FMUS_TAG: string = "fmus";
    private CONNECTIONS_TAG: string = "connections";
    private PARAMETERS_TAG: string = "parameters";
    private LIVESTREAM_TAG: string = "livestream";

    //Parse fmus json tag
    parseFmus(data: any, setPath: boolean): Map<String, FmuInfo> {

        var fmus: Map<String, FmuInfo> = new Map<string, FmuInfo>();

        if (Object.keys(data).indexOf(this.FMUS_TAG) >= 0) {
            $.each(Object.keys(data[this.FMUS_TAG]), (j, key) => {
                var description = "";
                var path = "";

                let value = data[this.FMUS_TAG][key];

                if (setPath) {
                    path = value
                } else {
                    description = value;
                }

                fmus.set(key, new FmuInfo(description, path));
            });
        }
        return fmus;
    }

    //    parseId(id: string): string[]

    //convert fmus to JSON
    toObject(fmus: Map<String, FmuInfo>): any {
        var data: any = new Object();

        fmus.forEach((value: FmuInfo, index: String) => {
            data[index + ""] = value.path;
        });

        var tmp: any = new Object();
        tmp[this.FMUS_TAG] = data;

        return tmp;
    }

    //parse connections
    parseConnections(data: any): Map<String, Collections.LinkedList<String>> {
        var connections: Map<String, Collections.LinkedList<String>> = new Map<String, Collections.LinkedList<String>>();

        if (Object.keys(data).indexOf(this.CONNECTIONS_TAG) >= 0) {
            let connectionsEntry = data[this.CONNECTIONS_TAG];
            $.each(Object.keys(connectionsEntry), (j, outputKey) => {
                let inputList = connectionsEntry[outputKey];

                var inputs: Collections.LinkedList<String> = new Collections.LinkedList<String>();
                $.each(inputList, function (j, input) {
                    inputs.add(input);
                });

                connections.set(outputKey, inputs);
            });

        }
        console.info("Connections: " + this.toObjectConnections(connections));
        return connections;
    }

    //toObjectConnections
    toObjectConnections(connections: Map<String, Collections.LinkedList<String>>): any {
        var cons: any = new Object();
        connections.forEach((value: Collections.LinkedList<String>, index: String) => {

            var inputs: any[] = [];
            value.forEach((input) => {
                inputs.push(input);
            });



            cons[index + ""] = inputs;
        })


        var constagged: any = new Object();
        constagged[this.CONNECTIONS_TAG] = cons;
        return constagged;
    }

    //parse parameters
    parseParameters(data: any): Map<String, any> {
        var parameters: Map<String, any> = new Map<String, any>();

        if (Object.keys(data).indexOf(this.PARAMETERS_TAG) >= 0) {
            let parameterData = data[this.PARAMETERS_TAG];
            $.each(Object.keys(parameterData), (j, key) => {
                let value = parameterData[key];
                parameters.set(key, value);
            });
        }

        return parameters;
    }

    //to JSON parameters
    toObjectParameters(parameters: Map<String, any>): any {
        var obj: any = new Object();

        parameters.forEach((value, index) => {
            obj[index + ""] = value;
        })

        var parametersObj: any = new Object();
        parametersObj[this.PARAMETERS_TAG] = obj;

        return parametersObj;
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

        console.info("Live stream: " + this.toObjectLivestream(livestream));
        return livestream;
    }

    toObjectLivestream(livestream: Map<String, Collections.LinkedList<String>>): any {
        var cons: any = new Object();
        livestream.forEach((value: Collections.LinkedList<String>, index: String) => {

            var inputs: any[] = [];
            value.forEach((input) => {
                inputs.push(input);
            });

            cons[index + ""] = inputs;
        })


        var constagged: any = new Object();
        constagged[this.LIVESTREAM_TAG] = cons;
        return constagged;
    }
}





export class CoeConfig {

    //new connections
    // c : Map<String,Map<String,Map<String,QualifiedScalarVariable[]>>> ;

    //fmu ID to project relative file path
    fmus: Map<String, FmuInfo> = new Map<string, FmuInfo>();
    //final parameters for the COE
    parameters: Map<String, any> = new Map<String, any>();
    //connection mapping
    connections: Map<String, Collections.LinkedList<String>> = new Map<String, Collections.LinkedList<String>>();
    //optional livestream outputs
    livestream: Map<String, Collections.LinkedList<String>> = new Map<String, Collections.LinkedList<String>>();
    //TODO: algorithm
    algorithm: Configs.CoeAlgorithm = null;

    //the start time
    startTime: number = 0;

    //the end time
    endTime: number = 10;

    //sources
    multimodelPath: string = null;
    sourcePath: string = null;

    ALGORITHM_TYPE_FIXED: String = "fixed-step";


    public loadFromMultiModel(path: string,fmuRootPath:string) {

        Configs.MultiModelConfig.parse(path,fmuRootPath)
            .then(mm => { console.info("Finished parsing multimodelconfig:"); console.info(mm); })
            .catch(err => { console.error(err); });

        let _this = this, parser = new DomParser();
        // Here we import the File System module of node
        let fs = require('fs');
        try {
            if (fs.accessSync(path, fs.R_OK)) {
                return;
            }
            var content = fs.readFileSync(path, "utf8");
           // console.log("Asynchronous read: " + content.toString());
            var jsonData = JSON.parse(content.toString());

            _this.connections = parser.parseConnections(jsonData);
            _this.parameters = parser.parseParameters(jsonData);
            _this.fmus = parser.parseFmus(jsonData, true);




        } catch (e) {
        }
        this.multimodelPath = path;
    }



    private parseAlgorithm(algorithmEntry: any) {

        if (Object.keys(algorithmEntry).indexOf("type") < 0) {
            console.info("Algorithm type not specified");
        } else {
            let type = algorithmEntry["type"];
            if (type.indexOf(this.ALGORITHM_TYPE_FIXED) == 0) {
                //fixed step
                this.algorithm = new Configs.FixedStepAlgorithm(algorithmEntry["size"]);
            }
        }

        //todo
    }


    public load(configPath: string, relativeRoot: string,fmuRootPath:string) {

        let _this = this, parser = new DomParser();;
        // Here we import the File System module of node
        let fs = require('fs');
        try {
            if (fs.accessSync(configPath, fs.R_OK)) {
                return;
            }
            var content = fs.readFileSync(configPath, "utf8");
           // console.log("Asynchronous read: " + content.toString());
            var jsonData = JSON.parse(content.toString());
            console.log(jsonData);

            //step 1 parse mm
            $.each(Object.keys(jsonData), function (j, key) {
                if (key.indexOf("multimodel_path") == 0) {
                    let mmPath = jsonData[key];
                    _this.loadFromMultiModel(Path.normalize(relativeRoot + "/" + mmPath), fmuRootPath);
                    return;
                }
            });

            _this.parameters = parser.parseParameters(jsonData);

            parser.parseFmus(jsonData, true).forEach((value: FmuInfo, index: String) => {
                _this.fmus.set(index, value);
            });

            _this.livestream = parser.parseLivestream(jsonData);


            //set 2 parse this config file
            $.each(Object.keys(jsonData), function (j, key) {

                if (key.indexOf("startTime") == 0) {
                    _this.startTime = jsonData[key];
                } else if (key.indexOf("endTime") == 0) {
                    _this.endTime = jsonData[key];
                } else if (key.indexOf("algorithm") == 0) {
                    _this.parseAlgorithm(jsonData[key]);
                }

            });

            console.info("Parsed cs: "); console.info(_this);

            console.info("Parsed toJSON: "); console.info(_this.toJSON());


        } catch (e) {
        }
        this.sourcePath = configPath;
    }




    public save() {

    }


    public toJSON(): string {

        let serializer = new DomParser();
        var dto: any = new Object();

        //FMUS
        Object.assign(dto,
            serializer.toObject(this.fmus),
            serializer.toObjectParameters(this.parameters),
            serializer.toObjectConnections(this.connections),
            serializer.toObjectLivestream(this.livestream),
            { "algorithm": this.algorithm.toJSON() });

        let jsonData = JSON.stringify(dto);
        console.info(jsonData);
        return jsonData;
    }
}


//Main DOM






