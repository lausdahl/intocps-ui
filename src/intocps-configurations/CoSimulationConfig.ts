
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />


import * as Collections from 'typescript-collections';
import * as Fmi from "../coe/fmi";
import {MultiModelConfig} from "./MultiModelConfig"
import {Parser} from "./Parser"



import Path = require('path');
import fs = require('fs');


export class CoSimulationConfig {
    multiModel: MultiModelConfig;
    sourcePath: string;

    //optional livestream outputs
    livestream: Map<Fmi.Instance, Fmi.ScalarVariable[]> = new Map<Fmi.Instance, Fmi.ScalarVariable[]>();
    //TODO: algorithm
    algorithm: ICoSimAlgorithm = new FixedStepAlgorithm(0.1);

    //the start time
    startTime: number = 0;

    //the end time
    endTime: number = 10;


    static create(path: string, projectRoot: string, fmuRootPath: string, jsonData: any): Promise<CoSimulationConfig> {
        return new Promise<CoSimulationConfig>(function (resolveFinal, reject) {
            var mmPath: string = null;
            $.each(Object.keys(jsonData), (j, key) => {
                if (key.indexOf("multimodel_path") == 0) {
                    mmPath = jsonData[key];
                    mmPath = Path.normalize(projectRoot + "/" + mmPath);
                    return;
                }
            });
            console.info("Parsing mm from cc with: " + mmPath);
            MultiModelConfig.parse(mmPath, fmuRootPath).then(mm => {
                let cc = new CoSimulationConfig();
                cc.multiModel = mm;
                let parser = new Parser();
                cc.sourcePath = path;
                
                cc.startTime = parser.parseStartTime(jsonData);
                cc.endTime = parser.parseEndTime(jsonData);
                cc.livestream = parser.parseLivestream(jsonData,mm);
                cc.algorithm = parser.parseAlgorithm(jsonData);

                resolveFinal(cc);
            }).catch(e => reject(e));
        });
    }

    static parse(path: string, rojectRoot: string, fmuRootPath: string): Promise<CoSimulationConfig> {
        let self = this;
        return new Promise<CoSimulationConfig>(function (resolveFinal, reject) {


            let checkFileExists = new Promise<Buffer>(function (resolve, reject) {
                try {
                    if (fs.accessSync(path, fs.R_OK)) {
                        reject();
                    }
                    resolve();
                } catch (e) {
                    reject(e);
                }
            }).then(() =>
                new Promise<Buffer>(function (resolve, reject) {
                    fs.readFile(path, function (err, data) {
                        if (err !== null) {
                            return reject(err);
                        }
                        resolve(data);
                    });
                })).then((content) => {

                    //console.log("Asynchronous read: " + content.toString());
                    var jsonData = JSON.parse(content.toString());
                    console.log(jsonData);

                    self.create(path, rojectRoot, fmuRootPath, jsonData).then(mm => { resolveFinal(mm); }).catch(e => reject(e));

                })
        });
    }
}


export interface ICoSimAlgorithm { }

export class FixedStepAlgorithm implements ICoSimAlgorithm {
    // fixed - step
    size: number = 0.1;

    constructor(size: number) {
        this.size = size;
    }
}

export class VariableStepAlgorithm implements ICoSimAlgorithm {

    //var - step 
    sizeMin: number;
    sizeMax: number;
    initSize: number;
    constraints: VarStepConstraint[];

}

export enum VarStepConstraintType { ZeroCrossing, BoundedDifference, SamplingRate, FmuRequested };
export class VarStepConstraint {

    type: VarStepConstraintType;
    ports: Fmi.InstanceScalarPair[];
    order: number = 2;//can be 1 or 2
    abstol: number;
    safety: number;
}



