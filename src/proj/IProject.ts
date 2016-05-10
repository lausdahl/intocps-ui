///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>

import {Container} from "./Container"
import {Config} from "./Config"
import {ConMap} from "./ConMap"

export interface IProject {
    getName(): string;
    getRootFilePath(): string;
    getProjectConfigFilePath(): string;
    getFmusPath(): string;
    getSysMlFolderName(): String;

    createMultiModel(name: String, jsonContent: String): String;
    createCoSimConfig(multimodelConfigPath: string, name: String, jsonContent: String): string;

    getContainers(): Array<Container>;
    getConfigs(): Array<Config>;
    getConMaps(): Array<ConMap>;
}
