///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>

import {ProjectSettings} from "./ProjectSettings"

export interface IProject {
    getName(): string;
    getRootFilePath(): string;
    getProjectConfigFilePath(): string;
    getFmusPath(): string;
    getSysMlFolderName(): String;
    save():void;

    createMultiModel(name: String, jsonContent: String): String;
    createCoSimConfig(multimodelConfigPath: string, name: String, jsonContent: String): string;

    getSettings(): ProjectSettings;
}
