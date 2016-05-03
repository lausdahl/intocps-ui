//TODO: DUMMY REFERENCE UNTIL CHART MAKES A TYPESCRIPT DEFINITION FILE!
///<reference path="Chart.d.ts"/>
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />

import * as Main from  "../settings/Settings"
import * as IntoCpsApp from  "../IntoCpsApp"
import {IntoCpsAppEvents} from "../IntoCpsAppEvents";
import Path = require('path');

import * as Collections from 'typescript-collections';

export class FmuInfo {
    description: string = "";
    path: string = null;

    constructor(description: string, path: string) {
        this.description = description;
        this.path = path;
    }
}

export interface CoeAlgorithm { toJSON(): any; }

export class FixedStepAlgorithm implements CoeAlgorithm {
    size: number = 0.1;

    constructor(size: number) {
        this.size = size;
    }

    toJSON() {
        var oA: any = new Object();
        oA["type"] = "fixed-step";
        oA["size"] = this.size;
        return oA;
    }
}

export class CoeConfig {
    //fmu ID to project relative file path
    fmus: Map<String, FmuInfo> = new Map<string, FmuInfo>();
    //final parameters for the COE
    parameters: Map<String, any> = new Map<String, any>();
    //connection mapping
    connections: Map<String, Collections.LinkedList<String>> = new Map<String, Collections.LinkedList<String>>();
    //optional livestream outputs
    livestream: Map<String, Collections.LinkedList<String>> = new Map<String, Collections.LinkedList<String>>();
    //TODO: algorithm
    algorithm: CoeAlgorithm = null;

    //the start time
    startTime: number = 0;

    //the end time
    endTime: number = 10;

    //sources
    multimodelPath: string = null;
    sourcePath: string = null;

    ALGORITHM_TYPE_FIXED: String = "fixed-step";


    public loadFromMultiModel(path: string) {
        let _this = this;
        // Here we import the File System module of node
        let fs = require('fs');
        try {
            if (fs.accessSync(path, fs.R_OK)) {
                return;
            }
            var content = fs.readFileSync(path, "utf8");
            console.log("Asynchronous read: " + content.toString());
            var jsonData = JSON.parse(content.toString());
            console.log(jsonData);

            $.each(Object.keys(jsonData), function (j, key) {

                if (key.indexOf("connections") == 0) {
                    var connectionsEntry = jsonData[key];
                    _this.parseConnections(connectionsEntry);
                } else if (key.indexOf("parameters") == 0) {
                    var parameters = jsonData[key];
                    _this.parseParameters(parameters);
                } else if (key.indexOf("fmus") == 0) {
                    let fmus = jsonData[key];
                    $.each(Object.keys(fmus), function (j, key) {
                        let description = fmus[key];
                        _this.fmus.set(key, new FmuInfo(description, description));
                    });
                }
            });

            console.info("Parsed mm: "); console.info(_this);


        } catch (e) {
        }
        this.multimodelPath = path;
    }

    private parseConnections(connectionsEntry: any) {
        let _this = this;
        $.each(Object.keys(connectionsEntry), function (j, outputKey) {
            let inputList = connectionsEntry[outputKey];

            var inputs: Collections.LinkedList<String> = new Collections.LinkedList<String>();
            $.each(inputList, function (j, input) {
                inputs.add(input);
            });

            _this.connections.set(outputKey, inputs);
        });
    }

    private parseParameters(parameters: any) {
        let _this = this;
        $.each(Object.keys(parameters), function (j, key) {
            let value = parameters[key];
            _this.parameters.set(key, value);
        });


    }

    private parseAlgorithm(algorithmEntry: any) {

        if (Object.keys(algorithmEntry).indexOf("type") < 0) {
            console.info("Algorithm type not specified");
        } else {
            let type = algorithmEntry["type"];
            if (type.indexOf(this.ALGORITHM_TYPE_FIXED) == 0) {
                //fixed step
                this.algorithm = new FixedStepAlgorithm(algorithmEntry["size"]);
            }
        }

        //todo
    }


    //check if we can merge this with parseConnections same code but differnt field
    private parseLivestream(livestreamEntry: any) {
        let _this = this;
        $.each(Object.keys(livestreamEntry), function (j, outputKey) {
            let inputList = livestreamEntry[outputKey];

            var inputs: Collections.LinkedList<String> = new Collections.LinkedList<String>();
            $.each(inputList, function (j, input) {
                inputs.add(input);
            });

            _this.livestream.set(outputKey, inputs);
        });
    }

    public load(configPath: string, relativeRoot: string) {

        let _this = this;
        // Here we import the File System module of node
        let fs = require('fs');
        try {
            if (fs.accessSync(configPath, fs.R_OK)) {
                return;
            }
            var content = fs.readFileSync(configPath, "utf8");
            console.log("Asynchronous read: " + content.toString());
            var jsonData = JSON.parse(content.toString());
            console.log(jsonData);

            //step 1 parse mm
            $.each(Object.keys(jsonData), function (j, key) {
                if (key.indexOf("multimodel_path") == 0) {
                    let mmPath = jsonData[key];
                    _this.loadFromMultiModel(Path.normalize(relativeRoot + "/" + mmPath));
                }
            });

            //set 2 parse this config file
            $.each(Object.keys(jsonData), function (j, key) {

                if (key.indexOf("parameters") == 0) {
                    var parameters = jsonData[key];
                    _this.parseParameters(parameters);
                } else if (key.indexOf("fmus") == 0) {
                    let fmus = jsonData[key];
                    $.each(Object.keys(fmus), function (j, key) {
                        let fmuPath = fmus[key];

                        if (_this.fmus.has(key)) {
                            //updathe path 
                            _this.fmus.get(key).path = fmuPath;
                        } else {
                            _this.fmus.set(key, new FmuInfo("", fmuPath));
                        }
                    });
                } else if (key.indexOf("startTime") == 0) {
                    _this.startTime = jsonData[key];
                } else if (key.indexOf("endTime") == 0) {
                    _this.endTime = jsonData[key];
                } else if (key.indexOf("algorithm") == 0) {
                    _this.parseAlgorithm(jsonData[key]);
                } else if (key.indexOf("livestream") == 0) {
                    _this.parseLivestream(jsonData[key]);
                }
            });

            console.info("Parsed cs: "); console.info(_this);


        } catch (e) {
        }
        this.sourcePath = configPath;
    }




    public save() {

    }


    public toJSON(): string {


        var dto: any = new Object();

        //FMUS
        var ofmu: any = new Object();
        this.fmus.forEach((value: FmuInfo, index: String, map: Map<String, FmuInfo>) => {
            ofmu[index + ""] = value.path;
        });
        dto["fmus"] = ofmu;

        //Parameters
        var oParameters: any = new Object();
        this.parameters.forEach((value: any, index: String, map: Map<String, any>) => {
            oParameters[index + ""] = value;
        });
        dto["parameters"] = oParameters;

        //algorithm
        if (this.algorithm != null) {
            dto["algorithm"] = this.algorithm.toJSON();
        }

        //connections
        var oConn: any = new Object();
        this.connections.forEach((value: Collections.LinkedList<String>, index: String, map: Map<String, Collections.LinkedList<String>>) => {
            var oIn: any[] = [];
            value.forEach((id) => { oIn.push(id); });
            oConn[index + ""] = oIn;
        });
        dto["connections"] = oConn;

        //live stream
        var oConn: any = new Object();
        this.livestream.forEach((value: Collections.LinkedList<String>, index: String, map: Map<String, Collections.LinkedList<String>>) => {
            var oIn: any[] = [];
            value.forEach((id) => { oIn.push(id); });
            oConn[index + ""] = oIn;
        });
        dto["livestream"] = oConn;


        let jsonData = JSON.stringify(dto);
        console.info(jsonData);
        return jsonData;
    }
}
