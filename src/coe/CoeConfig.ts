//TODO: DUMMY REFERENCE UNTIL CHART MAKES A TYPESCRIPT DEFINITION FILE!
///<reference path="Chart.d.ts"/>
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />

import * as Main from  "../settings/settings"
import * as IntoCpsApp from  "../IntoCpsApp"
import {IntoCpsAppEvents} from "../IntoCpsAppEvents";
import Path = require('path');

import * as Collections from 'typescript-collections';

import * as Fmi from "./fmi";

import * as Configs from "../intocps-configurations/intocps-configurations";


export class CoeConfig {

    private coSimConfig: Configs.CoSimulationConfig;
    private remoteCoe: boolean = false;

    constructor(coSimConfig: Configs.CoSimulationConfig, remoteCoe: boolean) {
        this.coSimConfig = coSimConfig;
        this.remoteCoe = remoteCoe;
    }

    public toJSON(): string {


        var objMm = this.coSimConfig.multiModel.toObject();

        var objCs = this.coSimConfig.toObject();


        var objFmus: any = new Object();
        this.coSimConfig.multiModel.fmus.forEach(fmu => {

            var path: string = null;

            if (this.remoteCoe) {
                path = "sesstion:/" + fmu.path;
            } else {
                path = fmu.path;
            }

            objFmus[fmu.name] = path;
        });


        var dto: any = new Object();

        //FMUS
        Object.assign(dto,
            objMm, objCs);

        delete dto["endTime"];
        delete dto["startTime"];
        delete dto["multimodel_path"];
        dto["fmus"] = objFmus;

        let jsonData = JSON.stringify(dto);
        console.info(jsonData);
        return jsonData;
    }
}





