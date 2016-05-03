///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>

import fs = require('fs');
import Path = require('path');

import {IProject} from "./IProject.ts"
import {Container} from "./Container.ts"
import {Config} from "./Config.ts"
import {ConMap} from "./ConMap.ts"

export class Project implements IProject {

    name: string;
    rootPath: string;
    configPath: string;
    containers : Array<Container>;
    configs: Array<Config>;
    conMaps: Array<ConMap>;

    constructor(name: string, rootPath: string, configPath: string, containers:Array<Container>,configs:Array<Config>,conMaps:Array<ConMap>) {
        this.name = name;
        this.rootPath = rootPath;
        this.configPath = configPath;
        this.containers = containers;
        this.configs= configs;
        this.conMaps = conMaps;
    }

    public getName(): string {
        return this.name;
    }


    public getRootFilePath(): string { return this.rootPath; }
    public getProjectConfigFilePath(): string { return this.configPath }

    public getContainers() {
      return this.containers;
    }

    public getConfigs() {
      return this.configs;
    }

    public getConMaps() {
      return this.conMaps;
    }

    //TODO: replace with proper folder struct
    public save() {

        let folders = ["sysml", "models", "fmus","conmaps","configs","results"];

        for (var i = 0; folders.length > i; i++) {
            try {
                var folder = folders[i];
                let path = Path.normalize(this.rootPath+"/"+folder);
                fs.mkdir(path,function (err){});
            } catch (e) {
                //already exists
            }
        }

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

        for (let c of this.configs) {
            c.save();
        }

        for (let c of this.conMaps) {
            c.save();
        }
    }
}
