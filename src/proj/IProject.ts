///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>


export interface IProject {
    getName():string;
    getRootFilePath():string;
    getProjectConfigFilePath():string;
    getSources():Array<string>;
}
