///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>

import {Container} from "./Container.ts"
import {Config} from "./Config.ts"
import {ConMap} from "./ConMap.ts"

export interface IProject {
    getName():string;
    getRootFilePath():string;
    getProjectConfigFilePath():string;
    getContainers():Array<Container>;
    getConfigs():Array<Config>;
    getConMaps():Array<ConMap>;
}
