
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />


import * as Collections from 'typescript-collections';
import * as Fmi from "../coe/fmi";
import {MultiModelConfig} from "./MultiModelConfig"

import Path = require('path');


export class CoSimulationConfig{
        multiModel: MultiModelConfig;

    //optional livestream outputs
    livestream: Map<Fmi.Instance, Fmi.ScalarVariable[]> = new Map<Fmi.Instance, Fmi.ScalarVariable[]>();
    //TODO: algorithm
    algorithm: CoeAlgorithm = null;

    //the start time
    startTime: number = 0;

    //the end time
    endTime: number = 10;
}


export interface CoeAlgorithm { toJSON(): any; }

export class FixedStepAlgorithm implements CoeAlgorithm {
    size: number = 0.1;

    constructor(size: number) {
        this.size = size;
    }

    toJSON() {
        var oA: any = new Object();
        oA["type"] = "fixed-step";
        oA["size"] = this.size;
        return oA;
    }
}



