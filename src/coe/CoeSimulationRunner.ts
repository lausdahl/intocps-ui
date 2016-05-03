//TODO: DUMMY REFERENCE UNTIL CHART MAKES A TYPESCRIPT DEFINITION FILE!
///<reference path="Chart.d.ts"/>
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />

import * as Main from  "../main/Settings"
import * as IntoCpsApp from  "../main/IntoCpsApp"
import {IntoCpsAppEvents} from "../main/IntoCpsAppEvents";
import {IProject} from "../main/IProject";
import {Fmu} from "./fmu"
import * as Collections from 'typescript-collections';
import {CoeConfig} from './CoeConfig'
import {SimulationCallbackHandler} from './SimulationCallbackHandler'
import Path = require('path');


export class CoeSimulationRunner {

    private coeConfig: CoeConfig = null;
    private project: IProject = null;

    private url: string = null;

    private statusCmd: string = "status/"
    private createSessionCmd: string = "createSession";
    private initializeSessionCmd: string = "initialize/";
    private simulateCmd: string = "simulate/";
    private resultCmd: string = "result";
    private resultCmdZipType: string = "zip";
    private destroyCmd: string = "destroy";
    private uploadCmd: string = "upload/";

    private sessionId = -1

    private setProgress: (progress: number, message: string) => any;
    private setProgressMessage: (message: string) => any;
    private getLiveChart: () => any;
    private initializeChartDatasets: (livestream: Map<String, Collections.LinkedList<String>>) => string[];

    private chartIds: string[] = [];


    // Here we import the File System module of node
    private fs = require('fs');

    constructor(project: IProject, coeConfig: CoeConfig, url: string, setProgress: (progress: number, message: string) => any,
        setProgressMessage: (message: string) => any,
        getLiveChart: () => any,
        initializeChartDatasets: (livestream: Map<String, Collections.LinkedList<String>>) => string[]
    ) {
        this.project = project;
        this.coeConfig = coeConfig;
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
        if (CoeConfig == null) {
            alert("Could not read simulation config.json from project root");
            return console.error("Unable to parse config file: ");

        }

        _this.chartIds = _this.initializeChartDatasets(_this.coeConfig.livestream);

        var _this = this;
        $.getJSON(this.getHttpUrl() + this.createSessionCmd)
            .fail(function (err) {
                console.log("error: " + err);
            })
            .done(function (data) {
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
        var _this = this;

        var div = <HTMLInputElement>document.getElementById("coe-debug");

        var message = "Uploading Fmu: "
        div.innerHTML = message;
        _this.setProgressMessage("Uploading Fmus");

        var formData = new FormData();

        _this.coeConfig.fmus.forEach(function (info, item) {

            var path: string = info.path;
            let SESSION = "session:/";

            if (path.indexOf(SESSION) == 0) {
                path = path.substring(SESSION.length);
            }

            message = message + path + ",";

            div.innerHTML = message;
            ///_this.setProgress(_this.progressState, message);

            let filePath = Path.normalize(_this.project.getFmusPath() + "/" + path);

            var content = _this.fs.readFileSync(filePath);
            var blob = new Blob([content], { type: "multipart/form-data" });

            formData.append('file', blob, path);



        })

        let url = _this.getHttpUrl() + _this.uploadCmd + _this.sessionId;

        $.ajax({
            url: url,
            type: 'POST',
            data: formData,
            processData: false,  // tell jQuery not to process the data
            contentType: false,  // tell jQuery not to set contentType
            success: function (data) {
                console.log(data);
                // alert(data);

                _this.setProgress(50, "FMU upload done.");

                _this.initializeCoe();
            }
        });
    }


    private initializeCoe() {
        var _this = this;

        _this.setDebugMessage("Initializing the COE");
        _this.setProgressMessage("Initializing the COE");

        var dat = _this.coeConfig.toJSON();
        let url = _this.getHttpUrl() + _this.initializeSessionCmd + _this.sessionId;


        jQuery.ajax({
            url: url,
            type: "POST",
            data: dat,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function () {
                _this.setProgress(50, "Initialization done.");
                _this.simulate();
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
            }
        }).fail(function () {

            console.error("error in simulation call");
            _this.setDebugMessage("Starting simulation: FAILED");
        });

    }


    //show debug message
    private setDebugMessage(message: string) {
        var div = <HTMLInputElement>document.getElementById("coe-debug");
        div.innerHTML = message;
    }




}