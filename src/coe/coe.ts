//TODO: DUMMY REFERENCE UNTIL CHART MAKES A TYPESCRIPT DEFINITION FILE!
///<reference path="Chart.d.ts"/>
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />

import * as Main from  "../settings/settings"
import {IntoCpsApp} from  "../IntoCpsApp"
import {IntoCpsAppEvents} from "../IntoCpsAppEvents";
import * as Collections from 'typescript-collections';

import {CoeSimulationRunner} from './CoeSimulationRunner'
import {IProject} from "../proj/IProject";
import {SettingKeys} from "../settings/SettingKeys";
import {SourceDom} from "../sourceDom"
import {IViewController} from "../iViewController"

import {CoSimulationConfig, Serializer} from "../intocps-configurations/intocps-configurations";
import {eventEmitter} from "../Emitter";

export class CoeController extends IViewController {

    coSimConfig: CoSimulationConfig = null;

    configButton: HTMLButtonElement;
    remote: Electron.Remote;
    dialog: Electron.Dialog;

    liveStreamCanvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;
    liveChart: any;

    enableDebugInfo: boolean = true;
    remoteCoe: boolean = false;

    private progressState: number = 0;

    app: IntoCpsApp;

    constructor(viewDiv: HTMLDivElement) {
        super(viewDiv);
        this.remote = require("remote");
        this.dialog = this.remote.require("dialog");
        this.app = IntoCpsApp.getInstance();
    }

    initialize(sourceDom: SourceDom): void {
        IntoCpsApp.setTopName("Co-Simulation")
        this.readSettings();
        this.setProgress(0, null);
        this.initializeChart();

        let activeProject = this.app.getActiveProject();
        if (activeProject == null) {
            console.warn("no active project cannot load coe config");
        }

        CoSimulationConfig.parse(sourceDom.getPath(), activeProject.getRootFilePath(), activeProject.getFmusPath())
            .then(cc => {
                console.info("CC:"); console.info(cc);
                this.coSimConfig = cc;
                this.bindData();

            })
            .catch(e => console.error(e));


        checkCoeConnection("coe-status", getCoeUrl());
    }

    private readSettings() {
        this.enableDebugInfo = IntoCpsApp.getInstance().getSettings().getSetting(SettingKeys.COE_DEBUG_ENABLED);
        if (this.enableDebugInfo == undefined) {
            this.enableDebugInfo = false;
        }

        this.remoteCoe = IntoCpsApp.getInstance().getSettings().getSetting(SettingKeys.COE_REMOTE_HOST);
        if (this.remoteCoe == undefined) {
            this.remoteCoe = false;
        }
    }

    private bindData() {
        //until bind is implemented we do this manual sync
        (<HTMLInputElement>document.getElementById("input-sim-time-start")).value = this.coSimConfig.startTime + "";
        (<HTMLInputElement>document.getElementById("input-sim-time-end")).value = this.coSimConfig.endTime + "";

        //        (<HTMLInputElement>document.getElementById("input-sim-algorithm-fixed-size")).value = (<Configs.FixedStepAlgorithm>this.coeConfig.algorithm).size + "";
        this.clearInfoMessages();
    }

    private clearInfoMessages() {
        var div = <HTMLElement>document.getElementById("simulation-info");
        while (div.hasChildNodes()) {
            div.removeChild(div.lastChild);
        }
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

    setDebugMessage(message: string) {

        if (this.enableDebugInfo) {

            var div = <HTMLInputElement>document.getElementById("simulation-info");

            var divStatus = document.createElement("div");
            divStatus.className = "alert alert-info";
            divStatus.innerHTML = message;
            div.appendChild(divStatus);
        }
    }

    setErrorMessage(message: string) {

        var div = <HTMLInputElement>document.getElementById("simulation-info");

        var divStatus = document.createElement("div");
        divStatus.className = "alert alert-danger";
        divStatus.innerHTML = message;
        div.appendChild(divStatus);

    }

    private simulationCompleted(success: boolean, message: string) {
        if (!success) {
            this.setErrorMessage(message);
        }
        else {
            var div = <HTMLInputElement>document.getElementById("simulation-info");

            var divStatus = document.createElement("div");
            divStatus.className = "alert alert-success";
            divStatus.innerHTML = "Simulation Completed: " + message;
            div.appendChild(divStatus);
            eventEmitter.emit(IntoCpsAppEvents.PROJECT_CHANGED);//TODO: we could downgrade this to resource added
        }
    }



    get_random_color() {
        function c() {
            var hex = Math.floor(Math.random() * 256).toString(16);
            return ("0" + String(hex)).substr(-2); // pad with zero
        }
        return "#" + c() + c() + c();
    }


    initializeChartDatasets(coSimConfig: CoSimulationConfig): string[] {
        let self = this;
        var ids: string[] = [];

        coSimConfig.livestream.forEach((value, index) => {
            value.forEach(sv => {
                ids.push(Serializer.getIdSv(index, sv));
            });
        });

        /* livestreams.forEach((value: Collections.LinkedList<String>, index: String, map: Map<String, Collections.LinkedList<String>>) => {
 
             value.forEach((id) => {
                 ids.push(index + "." + id);
             });
 
         });
 */

        var datasets: any[] = [];
        $.each(ids, function (i, id) {
            let color = self.get_random_color();
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
            console.warn(this.coSimConfig);
            return;
        }

        this.clearInfoMessages();

        let self = this;

        let url = getCoeUrl();

        let coeRunner = new CoeSimulationRunner(this.app.getActiveProject(),
            this.coSimConfig,
            this.remoteCoe,
            url,
            this.setProgress,
            this.setProgressMessage,
            () => self.liveChart,
            (coSimConfig: CoSimulationConfig) => { return self.initializeChartDatasets(self.coSimConfig); },
            (m) => { this.setDebugMessage(m) },
            this.setErrorMessage,
            (s, m) => this.simulationCompleted(s, m));
        coeRunner.runSimulation();
    }

}


export function checkCoeConnection(id: string, url: string) {

   return new Promise<void>(resolve => {
        let p = $.getJSON("http://" + url + "/version");
        setTimeout(function () { p.abort(); }, 1500);
        p.fail(function (err: any) {
            var div = <HTMLInputElement>document.getElementById(id);
            clearCoeStatus(id);

            var divStatus = document.createElement("div");
            divStatus.className = "alert alert-danger";
            divStatus.innerHTML = "Co-Simulation Engine, offline no connection at: " + url;
            div.appendChild(divStatus);

            setTimeout(function () {
                checkCoeConnection(id, url);
            }, 5000);

        })
            .done(function (data: any) {
                var div = <HTMLInputElement>document.getElementById(id);
                clearCoeStatus(id);
                var divStatus = document.createElement("div");
                divStatus.className = "alert alert-success";//alert alert-info
                divStatus.innerHTML = "Co-Simulation Engine, version: " + data.version + ", online at: " + url;
                div.appendChild(divStatus);

                var simulationPaneDiv = <HTMLElement>document.getElementById("simulation-pane");
                simulationPaneDiv.style.visibility = "visible";


            }).always(function () {
                console.info("always connection check");
            })
    });
}


function clearCoeStatus(id: string) {
    var div = <HTMLElement>document.getElementById(id);
    while (div.hasChildNodes()) {
        div.removeChild(div.lastChild);
    }
}


export function getCoeUrl(): string {
    let url = IntoCpsApp.getInstance().getSettings().getSetting(SettingKeys.COE_URL);

    if (url == null) {
        url = "localhost:8082";
    }
    return url;
}
