///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>



export class ProjectSettings {

    private owner: any;

    constructor(obj: any) {
        this.owner = obj;
    }

    setValue(key: string, value: any) {
        this.owner[key] = value;
    }


    getValue(key: string): any {
        return this.owner[key];
    }


}