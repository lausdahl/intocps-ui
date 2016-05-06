///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>

import fs = require('fs');
import Path = require('path');

import {IProject} from "./IProject"
import {Container} from "./Container"
import {Config} from "./Config"
import {ConMap} from "./ConMap"

export class Project implements IProject {

    name: string;
    rootPath: string;
    configPath: string;
    containers: Array<Container> = [];
    configs: Array<Config> = [];
    conMaps: Array<ConMap> = [];


    PATH_FMUS: String = "FMUs";
    PATH_MODELS: String = "Models";
    PATH_MULTI_MODELS: String = "Multi-models";
    PATH_DSE: String = "Design Space Explorations";
    //PATH_CONNECTIONS: String = "SysML Connections";
    PATH_SYSML: String = "SysML";

    constructor(name: string, rootPath: string, configPath: string) {
        this.name = name;
        this.rootPath = rootPath;
        this.configPath = configPath;
        //  this.containers = containers;
        // this.configs= configs;
        // this.conMaps = conMaps;
    }

    public getName(): string {
        return this.name;
    }


    public getRootFilePath(): string { return this.rootPath; }
    public getProjectConfigFilePath(): string { return this.configPath }
    public getFmusPath(): string { return Path.normalize(this.getRootFilePath() + "/" + this.PATH_FMUS); }

    public getContainers() {
        return this.containers;
    }

    public getConfigs() {
        return this.configs;
    }

    public getConMaps() {
        return this.conMaps;
    }

    public getSysMlFolderName(): String {
        return this.PATH_SYSML;
    }

    //TODO: replace with proper folder struct
    public save() {

        let folders = [this.PATH_SYSML, this.PATH_DSE, this.PATH_FMUS, this.PATH_MODELS, this.PATH_MULTI_MODELS];

        for (var i = 0; folders.length > i; i++) {
            try {
                var folder = folders[i];
                let path = Path.normalize(this.rootPath + "/" + folder);
                fs.mkdir(path, function (err) { });
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

        /*    for (let c of this.configs) {
               c.save();
           }
   
           for (let c of this.conMaps) {
               c.save();
           }*/
    }

    public createMultiModel(name: String, jsonContent: String): String {
        let path = Path.normalize(this.rootPath + "/" + this.PATH_MULTI_MODELS + "/" + name);

        fs.mkdirSync(path);

        let fullpath = Path.normalize(path + "/" + name + ".mm.json");

        fs.writeFileSync(fullpath, jsonContent == null ? "{}" : jsonContent, "UTF-8");

        return fullpath;
    }


    public createCoSimConfig(multimodelConfigPath: string, name: String, jsonContent: String): String {
        let mmDir = Path.dirname(multimodelConfigPath);
        let path = Path.normalize(mmDir + "/" + name);

        fs.mkdirSync(path);

        let fullpath = Path.normalize(path + "/" + name + ".coe.json");

        var data = jsonContent == null ? "{\"algorithm\":{\"type\":\"fixed-step\",\"size\":0.1},\"endTime\":10,\"startTime\":0}" : jsonContent;
      console.info(data);
        var json = JSON.parse(data + "");
        json["multimodel_path"] = multimodelConfigPath.substring(this.getRootFilePath().length + 1);

        data = JSON.stringify(json);
        console.info(data);
        fs.writeFileSync(fullpath, data, "UTF-8");

        return fullpath;
    }
}


