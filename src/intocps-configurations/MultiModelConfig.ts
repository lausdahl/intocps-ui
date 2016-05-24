
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />


import * as Collections from 'typescript-collections';
import * as Fmi from "../coe/fmi";
import {Parser, Serializer} from "./Parser";
import {Message, WarningMessage, ErrorMessage} from "./Messages";

import Path = require('path');
import fs = require('fs');
// Multi-Model

export class MultiModelConfig implements ISerializable {


    //path to the source from which this DOM is generated
    sourcePath: string;
    fmusRootPath: string;
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

    static create(path: string, fmuRootPath: string, jsonData: any): Promise<MultiModelConfig> {
        return new Promise<MultiModelConfig>(function (resolveFinal, reject) {
            let parser = new Parser();

            let mm = new MultiModelConfig();
            mm.sourcePath = path;
            mm.fmusRootPath = fmuRootPath;

            parser.parseFmus(jsonData, Path.normalize(fmuRootPath)).then(fmus => {
                mm.fmus = fmus;

                parser.parseConnections(jsonData, mm);
                parser.parseParameters(jsonData, mm);
                console.info(mm);

                resolveFinal(mm);
            }).catch(e => reject(e));
        });
    }

    static parse(path: string, fmuRootPath: string): Promise<MultiModelConfig> {
        let self = this;
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

                    //console.log("Asynchronous read: " + content.toString());
                    var jsonData = JSON.parse(content.toString());
                    console.log(jsonData);

                    self.create(path, fmuRootPath, jsonData).then(mm => { resolveFinal(mm); }).catch(e => reject(e));

                })
        });
    }

    public removeFmu(fmu: Fmi.Fmu) {
        this.fmus.splice(this.fmus.indexOf(fmu), 1);
        this.fmuInstances.filter(element => { return element.fmu == fmu }).forEach(element => {
            this.removeInstance(element);
        });
    }


    public removeInstance(instance: Fmi.Instance) {
        // Remove the instance
        this.fmuInstances.splice(this.fmuInstances.indexOf(instance), 1);

        // When removing an instance, all connections to this instance must be removed as well.  
        this.fmuInstances.forEach(element => {
            element.outputsTo.forEach((value, key) => {
                for (let i = value.length - 1; i >= 0; i--) {
                    if (value[i].instance == instance) {
                        value.splice(i, 1);
                    }
                }
            });
        });
    }

    toObject(): any {
        return new Serializer().toObjectMultiModel(this, this.fmusRootPath);
    }

    validate(): WarningMessage[] {
        let messages: WarningMessage[] = [];

        // perform check
        this.fmuInstances.forEach(instance => {
            //check connections
            instance.outputsTo.forEach((pairs, sv) => {
                if (sv.isConfirmed) {
                    pairs.forEach(pair => {
                        if (pair.scalarVariable.isConfirmed) {
                            if (!Fmi.isTypeCompatiple(sv.type, pair.scalarVariable.type)) {
                                let m: ErrorMessage = { message: "Uncompatible types in connection. The output scalar variable \"" + sv.name + "\": " + sv.type + " is connected to scalar variable \"" + pair.scalarVariable.name + "\": " + pair.scalarVariable.type };
                                messages.push(m);
                            }
                        }
                        else {
                            let m: WarningMessage = { message: "Use of unconfirmed ScalarVariable: \"" + pair.scalarVariable.name + "\" as connection input" };
                            messages.push(m);
                        }
                    });
                } else {
                    let m: WarningMessage = { message: "Use of unconfirmed ScalarVariable: \"" + sv.name + "\" as connection output" };
                    messages.push(m);
                }
            });

            //check parameters
            instance.initialValues.forEach((value, sv) => {
                if (sv.isConfirmed) {
                    if (!Fmi.isTypeCompatipleWithValue(sv.type, value)) {
                        let m: ErrorMessage = { message: "Uncompatible types for parameter. ScalarVariable: \"" + sv.name + "\" Value: " + value };
                        messages.push(m);
                    }
                } else {
                    let m: WarningMessage = { message: "Use of unconfirmed ScalarVariable: \"" + sv.name + "\" as parameter" };
                    messages.push(m);
                }
            });
        });

        return messages;
    }

    save(): Promise<void> {
        let self = this;
        return new Promise<void>(function (resolve, reject) {
            let messages = self.validate();
            if (messages.length > 0) {
                reject(messages);
            }
            try {
                fs.writeFile(self.sourcePath, JSON.stringify(self.toObject()), function (err) {
                    if (err !== null) {
                        return reject(err);
                    }
                    resolve();
                });
            } catch (e) {
                reject(e);
            }
        });
    }
}