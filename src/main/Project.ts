///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>

import fs = require('fs');

import {IProject} from "./IProject.ts"

export class Project implements IProject {

    name: string;
    rootPath: string;
    configPath: string;



    constructor(name: string, rootPath: string, configPath: string) {
        this.name = name;
        this.rootPath = rootPath;
        this.configPath = configPath;
    }

    public getName(): string {
        return this.name;
    }


    public getRootFilePath(): string { return this.rootPath; }
    public getProjectConfigFilePath(): string { return this.configPath }

    public save() {
        fs.open(this.configPath, "w", (err, fd) => {
            if (err) {
                "The error: " + err + " happened when attempting to open the file: " + this.configPath + " for writing.";
            }
            else {
                fs.write(fd, JSON.stringify(this), (err) => {
                    if (err) {
                        console.log("Failed to write settings in : " + this.configPath + ".");
                    }
                    else {
                        console.log("Stored settings in : " + this.configPath + ".");
                    }
                    fs.close(fd, (err) => {
                        if (err) {
                            console.log("Failed to close writing to the file: " + this.configPath + ".");
                            throw err;
                        }
                    });
                });
            }
        });
    }
}


