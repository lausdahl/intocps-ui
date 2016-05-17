//TODO: DUMMY REFERENCE UNTIL CHART MAKES A TYPESCRIPT DEFINITION FILE!
///<reference path="Chart.d.ts"/>
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />

import * as Main from  "../settings/settings"
import * as IntoCpsApp from  "../IntoCpsApp"
import {IntoCpsAppEvents} from "../IntoCpsAppEvents";
import {IProject} from "../proj/IProject";
import * as Collections from 'typescript-collections';

import {CoSimulationConfig, MultiModelConfig} from "../intocps-configurations/intocps-configurations";

import {SimulationCallbackHandler} from './SimulationCallbackHandler'
import {CoeConfig} from "./CoeConfig"

import Path = require('path');
import fs = require('fs');


export class CoeSimulationRunner {

    private coSimConfig: CoSimulationConfig = null;
    private project: IProject = null;
    private remoteCoe: boolean = false;

    private url: string = null;

    private statusCmd: string = "status/"
    private createSessionCmd: string = "createSession";
    private initializeSessionCmd: string = "initialize/";
    private simulateCmd: string = "simulate/";
    private resultCmd: string = "result/";
    private resultCmdZipType: string = "zip";
    private destroyCmd: string = "destroy";
    private uploadCmd: string = "upload/";

    private sessionId = -1

    private setProgress: (progress: number, message: string) => any;
    private setProgressMessage: (message: string) => any;
    private getLiveChart: () => any;
    private initializeChartDatasets: (coeConfig: CoSimulationConfig) => string[];

    private chartIds: string[] = [];


    // Here we import the File System module of node
    private fs = require('fs');

    constructor(project: IProject, coSimConfig: CoSimulationConfig, url: string, setProgress: (progress: number, message: string) => any,
        setProgressMessage: (message: string) => any,
        getLiveChart: () => any,
        initializeChartDatasets: (coeConfig: CoSimulationConfig) => string[]
    ) {
        this.project = project;
        this.coSimConfig = coSimConfig;
        this.url = url;
        this.setProgress = setProgress;
        this.setProgressMessage = setProgressMessage;
        this.getLiveChart = getLiveChart;
        this.initializeChartDatasets = initializeChartDatasets;
    }

    public runSimulation() {
        this.launch();
    }

    private getHttpUrl() {
        return "http://" + this.url + "/";
    }

    private getWsUrl() {
        return "ws://" + this.url + "/";
    }

    // launch a co-simulation by creating the session as step 1
    private launch() {
        var _this = this;

        // _this.setProgress(15, "Creating session");
        _this.setProgress(0, null);

        // var cfg = _this.parseConfig(_this.getConfigFile());
        if (this.coSimConfig == null) {
            alert("Could not read simulation config.json from project root");
            return console.error("Unable to parse config file: ");

        }

        _this.chartIds = _this.initializeChartDatasets(_this.coSimConfig);

        var _this = this;
        $.getJSON(this.getHttpUrl() + this.createSessionCmd)
            .fail(function (err: any) {
                console.log("error: " + err);
            })
            .done(function (data: any) {
                console.log("data:" + data);

                var div = <HTMLInputElement>document.getElementById("coe-debug");
                _this.sessionId = data.sessionId;
                _this.setDebugMessage("Session created with id: " + data.sessionId);

                _this.setProgress(25, null);// "Session created");
                _this.uploadFmus();

            });
    }

    //Upload fmus to the coe
    private uploadFmus() {
        var self = this;

        if (!this.remoteCoe) {
            self.setProgress(50, "FMU upload skipped.");

            self.initializeCoe();
            return;
        }



        var div = <HTMLInputElement>document.getElementById("coe-debug");

        var message = "Uploading Fmu: "
        div.innerHTML = message;
        self.setProgressMessage("Uploading Fmus");

        var formData = new FormData();

        self.coSimConfig.multiModel.fmus.forEach(function (value) {

            var path: string = value.path;
            let SESSION = "session:/";

            if (path.indexOf(SESSION) == 0) {
                path = path.substring(SESSION.length);
            }

            message = message + path + ",";

            div.innerHTML = message;
            ///_this.setProgress(_this.progressState, message);

            let filePath = Path.normalize(self.project.getFmusPath() + "/" + path);

            var content = self.fs.readFileSync(filePath);
            var blob = new Blob([content], { type: "multipart/form-data" });

            formData.append('file', blob, path);



        })

        let url = self.getHttpUrl() + self.uploadCmd + self.sessionId;

        $.ajax({
            url: url,
            type: 'POST',
            data: formData,
            processData: false,  // tell jQuery not to process the data
            contentType: false,  // tell jQuery not to set contentType
            success: function (data: any) {
                console.log(data);
                // alert(data);

                self.setProgress(50, "FMU upload done.");

                self.initializeCoe();
            }
        });
    }


    private initializeCoe() {
        var self = this;

        self.setDebugMessage("Initializing the COE");
        self.setProgressMessage("Initializing the COE");

        var dat = new CoeConfig(self.coSimConfig, this.remoteCoe).toJSON();
        let url = self.getHttpUrl() + self.initializeSessionCmd + self.sessionId;

        console.info("COE init: " + url);
        console.info(dat);

        jQuery.ajax({
            url: url,
            type: "POST",
            data: dat,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function () {
                self.setProgress(50, "Initialization done.");
                self.simulate();
            }
        });

    }

    private simulate() {

        let callback = new SimulationCallbackHandler();
        callback.chart = this.getLiveChart();
        callback.connect(this.getWsUrl() + "attachSession/" + this.sessionId);
        callback.chartIds = this.chartIds;

        var _this = this;


        let startTime = +(<HTMLInputElement>document.getElementById("input-sim-time-start")).value;
        let endTime = +(<HTMLInputElement>document.getElementById("input-sim-time-end")).value;

        var dat = JSON.stringify({ startTime: startTime, endTime: endTime });
        let url = _this.getHttpUrl() + _this.simulateCmd + _this.sessionId;

        _this.setDebugMessage("Starting simulation");
        _this.setProgressMessage("Simulating");

        jQuery.ajax({
            url: url,
            type: "POST",
            data: dat,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function () {
                _this.setProgress(100, "Simulation done.");
                _this.downloadResults();
            }
        }).fail(function () {

            console.error("error in simulation call");
            _this.setDebugMessage("Starting simulation: FAILED");
        });

    }

    private downloadResults() {
        let _this = this;
        let currentDir = Path.dirname(this.coSimConfig.sourcePath);
        let resultDirPath = Path.normalize(currentDir + "/R_" + new Date().toLocaleString().replace(/\//gi, "-").replace(/,/gi, "").replace(/ /gi, "_").replace(/:/gi, "-"));

        fs.mkdir(resultDirPath, (err) => {

            if (err)
                return;

            let url = _this.getHttpUrl() + _this.resultCmd + _this.sessionId;

            $.get(url, function (data) {
                fs.writeFile(Path.normalize(resultDirPath + "/log.csv"), data);
            });

        });

    }

    //show debug message
    private setDebugMessage(message: string) {
        var div = <HTMLInputElement>document.getElementById("coe-debug");
        div.innerHTML = message;
    }
}