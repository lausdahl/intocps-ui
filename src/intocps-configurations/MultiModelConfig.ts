
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />


import * as Collections from 'typescript-collections';
import * as Fmi from "../coe/fmi";
import {Parser} from "./Parser";


import Path = require('path');
import fs = require('fs');
// Multi-Model

export class MultiModelConfig {


    //path to the source from which this DOM is generated
    sourcePath: string;
    fmus: Fmi.Fmu[] = [];
    fmuInstances: Fmi.Instance[] = [];

    public getInstance(fmuName: string, instanceName: string) {
        let res = this.fmuInstances.find(function (v) { return v.fmu.name == fmuName && v.name == instanceName; });
        if (res == undefined) {
            return null;
        }
        return res;
    }

    public getInstanceOrCreate(fmuName: string, instanceName: string) {
        var instance = this.getInstance(fmuName, instanceName);

        if (instance == null) {
            //multimodel does not contain this instance
            let fmu = this.getFmu(fmuName);

            if (fmu == null) {
                throw "Cannot create connection fmu is missing for: " + fmuName;
            }

            instance = new Fmi.Instance(fmu, instanceName);
            this.fmuInstances.push(instance);
        }

        return instance;
    }



    public getFmu(fmuName: string): Fmi.Fmu {
        let res = this.fmus.find(function (v) { return v.name == fmuName; });
        if (res == undefined) {
            return null;
        }
        return res;
    }

    static parse(path: string): Promise<MultiModelConfig> {
        return new Promise<MultiModelConfig>(function (resolveFinal, reject) {


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

                    console.log("Asynchronous read: " + content.toString());
                    var jsonData = JSON.parse(content.toString());
                    console.log(jsonData);
                    let parser = new Parser();

                    let mm = new MultiModelConfig();
                    mm.sourcePath = path;

                    parser.parseFmus(jsonData, Path.normalize("/Users/kel/data/into-cps/intocps-ui/test-project/FMUs")).then(fmus => {
                        mm.fmus = fmus;

                        parser.parseConnections(jsonData, mm);
                        console.info(mm);

                        resolveFinal(mm);
                    });

                });
        });
    }
}
