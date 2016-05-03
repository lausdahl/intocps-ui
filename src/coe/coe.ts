//TODO: DUMMY REFERENCE UNTIL CHART MAKES A TYPESCRIPT DEFINITION FILE!
///<reference path="Chart.d.ts"/>
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />

import * as Main from  "../main/Settings"
import * as IntoCpsApp from  "../main/IntoCpsApp"
import {IntoCpsAppEvents} from "../main/IntoCpsAppEvents";
import {Fmu} from "./fmu"
import * as Collections from 'typescript-collections';
import {CoeConfig} from './CoeConfig'
import {CoeSimulationRunner} from './CoeSimulationRunner'
import {IProject} from "../main/IProject";
import {SettingKeys} from "../main/SettingKeys";

export class CoeController {

    coeConfig: CoeConfig = new CoeConfig();

    fmuCounter: number = 0;

    configButton: HTMLButtonElement;
    remote: Electron.Remote;
    dialog: Electron.Dialog;
    projectRootPath: HTMLInputElement;

    liveStreamCanvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;
    liveChart: any;
    fmusDiv: HTMLDivElement;
    fmus: Fmu[] = [];

    progressState: number = 0;

    app: IntoCpsApp.IntoCpsApp;

    constructor() {
        this.remote = require("remote");
        this.dialog = this.remote.require("dialog");
        this.app = this.remote.getGlobal("intoCpsApp");
    }

    initialize() {
        this.projectRootPath = <HTMLInputElement>document.getElementById("projectRootPathText");
        this.fmusDiv = <HTMLDivElement>document.getElementById("fmusDiv");

        this.setProgress(0, null);
        this.initializeChart();


        var remote = require('remote');
        var Menu = remote.require('menu');
        var ipc = require('electron').ipcRenderer;
        ipc.on(IntoCpsAppEvents.PROJECT_CHANGED, function (event, arg) {
            console.log("project-changed");  // prints "ping"

        });
    }

    public load(path: string) {
        let activeProject = this.app.getActiveProject();
        if (activeProject == null) {
            console.warn("no active project cannot load coe config");
        }

        this.fmus.forEach((value: Fmu, index: number, array: Fmu[]) => {
            this.removeFmu(value);
        });

        this.coeConfig = new CoeConfig();
        this.coeConfig.load(path, activeProject.getRootFilePath());

        //until bind is implemented we do this manual sync
        (<HTMLInputElement>document.getElementById("input-sim-time-start")).value = this.coeConfig.startTime + "";
        (<HTMLInputElement>document.getElementById("input-sim-time-end")).value = this.coeConfig.endTime + "";

        this.coeConfig.fmus.forEach((value, index, map) => {
            this.addFmu(index + "", value.path);
        });
    }

    initializeChart() {
        this.liveStreamCanvas = <HTMLCanvasElement>document.getElementById("liveStreamCanvas");
        this.canvasContext = this.liveStreamCanvas.getContext("2d");
        var lineData: any = {
            labels: [],
            datasets: []
        };
        //Creating labels every 10th number
        for (var i = 1; i <= 100; i++) {
            if (i % 10 == 0)
                lineData.labels.push(i);
            else
                lineData.labels.push("");
        }
        this.liveChart = new Chart(this.canvasContext, {
            type: "line",
            data: lineData,

            options: {

                scales: {
                    yAxes: [{
                        ticks: {
                            suggestedMin: -3,
                            suggestedMax: 3
                        }
                    }]
                }
            }
        });

    }

    launchProjectExplorer() {
        let dialogResult: string[] = this.dialog.showOpenDialog({ properties: ["openFile"] });
        if (dialogResult != undefined) {
            this.projectRootPath.value = dialogResult[0];
            this.load(this.projectRootPath.value);
        }
    }


    //Set the progress bar 
    setProgress(progress: number, message: string) {

        var divProgress = <HTMLInputElement>document.getElementById("coe-progress");
        let tmp = progress.toString() + "%";

        divProgress.style.width = tmp;
        if (message != null) {
            divProgress.innerHTML = tmp + " - " + message;
        } else {
            divProgress.innerHTML = tmp;
        }
        this.progressState = progress;
    }

    //sets the progress message but leaves the progress unchanged
    setProgressMessage(message: string) {
        this.setProgress(this.progressState, message);
    }


    removeFmu(fmu: Fmu) {
        this.fmusDiv.removeChild(fmu.getHtml());
        this.fmus.splice(this.fmus.indexOf(fmu), 1);
    };

    addFmu(fmuName: string, path: string) {
        // https://forum.jquery.com/topic/load-but-append-data-instead-of-replace
        let self = this;
        $('<div>').load("coe/fmu.html", function (event: JQueryEventObject) {
            let fmuHtml: HTMLElement = <HTMLElement>(<HTMLDivElement>this).firstChild;
            let name = fmuName == null ? "{FMU" + self.fmuCounter + "}" : fmuName;
            let newFmu: Fmu = new Fmu(fmuHtml, self.removeFmu.bind(self), name, path);
            self.fmus.push(newFmu);
            self.fmusDiv.appendChild(fmuHtml);
            self.fmuCounter++;
        });
    }

    setDebugMessage(message: string) {
        var div = <HTMLInputElement>document.getElementById("coe-debug");
        div.innerHTML = message;
    }


    get_random_color() {
        function c() {
            var hex = Math.floor(Math.random() * 256).toString(16);
            return ("0" + String(hex)).substr(-2); // pad with zero
        }
        return "#" + c() + c() + c();
    }


    initializeChartDatasets(livestreams: Map<String, Collections.LinkedList<String>>): string[] {
        let _this = this;
        var ids: string[] = [];

        livestreams.forEach((value: Collections.LinkedList<String>, index: String, map: Map<String, Collections.LinkedList<String>>) => {

            value.forEach((id) => {
                ids.push(index + "." + id);
            });

        });


        var datasets: any[] = [];
        $.each(ids, function (i, id) {
            let color = _this.get_random_color();
            datasets.push({
                label: id,
                // Boolean - if true fill the area under the line
                fill: false,
                // String - the color to fill the area under the line with if fill is true
                backgroundColor: color/*"rgba(220,220,220,0.2)"*/,
                // The properties below allow an array to be specified to change the value of the item at the given index
                // String or array - Line color
                borderColor: color/*"rgba(220,220,220,1)"*/,
                // String - cap style of the line. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap
                borderCapStyle: 'butt',
                // Array - Length and spacing of dashes. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash
                borderDash: [],
                // Number - Offset for line dashes. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset
                borderDashOffset: 0.0,
                // String - line join style. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin
                borderJoinStyle: 'miter',
                // String or array - Point stroke color
                pointBorderColor: "rgba(220,220,220,1)",
                // String or array - Point fill color
                pointBackgroundColor: "#fff",
                // Number or array - Stroke width of point border
                pointBorderWidth: 1,
                // Number or array - Radius of point when hovered
                pointHoverRadius: 5,
                // String or array - point background color when hovered
                pointHoverBackgroundColor: "rgba(220,220,220,1)",
                // Point border color when hovered
                pointHoverBorderColor: "rgba(220,220,220,1)",
                // Number or array - border width of point when hovered
                pointHoverBorderWidth: 2,

                // Tension - bezier curve tension of the line. Set to 0 to draw straight Wlines connecting points
                tension: 0.1,
                // The actual data
                data: [],
            });
            //    this.liveChart.data.datasets
        });

        this.liveChart.data.datasets = datasets;
        console.info("Livestream ids:");
        console.info(ids);
        return ids;
    }

    //validate the coesstings config
    validate(): boolean {
        //TODO
        return true;
    }

    public simulate() {

        if (!this.validate()) {
            console.warn("Unable to launch simulation due to invalid COE config.");
            console.warn(this.coeConfig);
            return;
        }

        let _this2 = this;

        let url = this.app.getSettings().getSetting(SettingKeys.COE_URL);

        if (url == null) {
            url = "localhost:8082";
        }

        let coeRunner = new CoeSimulationRunner(this.app.getActiveProject(),
            this.coeConfig,
            url,
            this.setProgress,
            this.setProgressMessage,
            () => _this2.liveChart,
            (livestream: Map<String, Collections.LinkedList<String>>) => { return _this2.initializeChartDatasets(livestream); });
        coeRunner.runSimulation();
    }

}

