// TODO: DUMMY REFERENCE UNTIL CHART MAKES A TYPESCRIPT DEFINITION FILE!
///<reference path="Chart.d.ts"/>
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
class CoeController {
    
    url: string = "http://localhost:8082/";

    statusCmd: string = "status/";
    createSessionCmd: string = "createSession";
    initializeSessionCmd: string = "initialize/";
    simulateCmd: string = "simulate/";
    resultCmd: string = "result";
    resultCmdZipType: string = "zip";
    destroyCmd: string = "destroy";
    uploadCmd: string = "upload/";

    configButton: HTMLButtonElement;
    remote: Electron.Remote;
    dialog: Electron.Dialog;
    projectRootPath: HTMLInputElement;

    liveStreamCanvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;
    liveChart: any;

    configFileName = "config.json";

    config: Object;

    sessionId = -1

    // Here we import the File System module of node
    private fs = require("fs");

    constructor() {
        this.remote = require("remote");
        this.dialog = this.remote.require("dialog");
    }

    initialize() {
        this.projectRootPath = <HTMLInputElement>document.getElementById("projectRootPathText");
        this.projectRootPath.value = "C:\\source\\into-cps-public\\test-sim";
        this.setProgress(0, null);
        this.initializeChart();
    }

    initializeChart() {
        this.liveStreamCanvas = <HTMLCanvasElement>document.getElementById("liveStreamCanvas");
        this.canvasContext = this.liveStreamCanvas.getContext("2d");
        var lineData: any = {
            labels: [],
            datasets: [
                {
                    label: "X2 tank output",
                    // Boolean - if true fill the area under the line
                    fill: false,
                    // String - the color to fill the area under the line with if fill is true
                    backgroundColor: "rgba(220,220,220,0.2)",
                    // The properties below allow an array to be specified to change the value of the item at the given index
                    // String or array - Line color
                    borderColor: "rgba(220,220,220,1)",
                    // String - cap style of the line. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap
                    borderCapStyle: "butt",
                    // Array - Length and spacing of dashes. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash
                    borderDash: [],
                    // Number - Offset for line dashes. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset
                    borderDashOffset: 0.0,
                    // String - line join style. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin
                    borderJoinStyle: "miter",
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
                }
            ]
        };
        // Creating labels every 10th number
        for (var i : number = 1; i <= 100; i++) {
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
        let dialogResult: string[] = this.dialog.showOpenDialog({ properties: ["openDirectory"] });
        if (dialogResult != undefined) {
            this.projectRootPath.value = dialogResult[0];
        }


    }

    getConfigFile(): string {
        return this.projectRootPath.value + "/" + this.configFileName;
    }


    uploadFmus() {
        var _this : CoeController = this;

        var div : HTMLInputElement = <HTMLInputElement>document.getElementById("coe-debug");

        var res : any = _this.parseConfig(_this.getConfigFile());

        var message : string = "Uploading Fmu: "
        div.innerHTML = message;
        _this.setProgress(_this.progressState, "Uploading Fmus");

        var formData : FormData = new FormData();

        $.each(res.fmus, function (i, item) {

            var path: string = item;
            let SESSION = "session:/";

            if (path.indexOf(SESSION) == 0) {
                path = path.substring(SESSION.length);
            }

            message = message + path + ",";

            div.innerHTML = message;
            ///_this.setProgress(_this.progressState, message);

            let filePath = _this.projectRootPath.value + "/" + path;

            var content : any = _this.fs.readFileSync(filePath);
            var blob : Blob = new Blob([content], { type: "multipart/form-data" });

            formData.append("file", blob, path);



        })

        let url = _this.url + _this.uploadCmd + _this.sessionId;

        $.ajax({
            url: url,
            type: "POST",
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

    setDebugMessage(message: string) {
        var div : HTMLInputElement = <HTMLInputElement>document.getElementById("coe-debug");
        div.innerHTML = message;
    }

    initializeCoe() {
        var _this = this;

        _this.setDebugMessage("Initializing the COE");
        _this.setProgress(_this.progressState, "Initializing the COE");

        var dat : string = JSON.stringify(_this.config);
        let url : string = _this.url + _this.initializeSessionCmd + _this.sessionId;


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

    simulate() {

        let callback = new SimulationCallbackHandler();
        callback.chart = this.liveChart;
        callback.connect("ws://localhost:8082/attachSession/" + this.sessionId);

        var _this : CoeController = this;
        var dat : string = JSON.stringify({ startTime: 0, endTime: 10 });
        let url : string = _this.url + _this.simulateCmd + _this.sessionId;

        _this.setDebugMessage("Starting simulation");
        _this.setProgress(_this.progressState, "Simulating");

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

    parseConfig(path: string): any {

        var content : any = this.fs.readFileSync(path, "utf8");
        console.log("Asynchronous read: " + content.toString());
        var cfg : any = JSON.parse(content.toString());
        console.log(cfg);
        return cfg;
    }

    launch() {
        var _this = this;

        // _this.setProgress(15, "Creating session");
        _this.setProgress(0, null);

        var cfg = _this.parseConfig(_this.getConfigFile());
        if (cfg == null) {
            return console.error("Unable to parse config file: " + _this.getConfigFile());

        }

        _this.config = cfg;

        var divCoeFmus = <HTMLInputElement>document.getElementById("coe-fmus");
        $.each(cfg.fmus, function (i, item) {
            var fmuBtn = <HTMLDivElement>document.createElement("div");
            divCoeFmus.appendChild(fmuBtn);
            fmuBtn.innerHTML = item;

        });


        var _this = this;
        $.getJSON(this.url + this.createSessionCmd)
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

    progressState: number = 0;

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

}


class SimulationCallbackHandler {

    public chart: Chart;
    connect(url: string) {

        var websocket : WebSocket= new WebSocket(url);
        let _this : SimulationCallbackHandler = this;
        websocket.onopen = function (evt) { _this.onOpen(evt) };
        websocket.onclose = function (evt) { _this.onClose(evt) };
        websocket.onmessage = function (evt) { _this.onMessage(evt) };
        websocket.onerror = function (evt) { _this.onError(evt) };


        var style : HTMLStyleElement = document.createElement("style");
        style.type = "text/css";
        style.innerHTML = ".string { color: green; } .number { color: darkorange; } .boolean { color: blue; } .null { color: magenta; } .key { color: red; } ";
        document.getElementsByTagName("head")[0].appendChild(style);
    }

    onOpen(evt: any) {
        this.output("CONNECTED");
    }

    onClose(evt: any) {
        this.output("<span style='color: orange;'>CLOSE: </span> ")
        this.output("DISCONNECTED");
    }

    onMessage(evt: any) {
        var jsonData = JSON.parse(evt.data);
        var str = JSON.stringify(jsonData, undefined, 4);
        this.output(this.syntaxHighlight(str));
        this.chart.data.datasets[0].data.push(jsonData["{x2}"]["tank"]["level"]);
        this.chart.update();
    }

    onError(evt: any) {
        this.output("<span style='color: red;'>ERROR:</span> " + evt.data);
    }

    output(inp: string) {

        let div = <HTMLInputElement>document.getElementById("coe-callback");

        let pre = document.createElement("pre");

        /* pre {outline: 1px solid #ccc; padding: 5px; margin: 5px; }
.string { color: green; }
.number { color: darkorange; }
.boolean { color: blue; }
.null { color: magenta; }
.key { color: red; } */
        pre.style.outline = "1px solid #ccc";
        pre.style.padding = "5px";
        pre.style.margin = "5px";


        pre.innerHTML = inp;
        div.appendChild(pre);

        // document.body.appendChild(document.createElement('pre')).innerHTML = inp;
    }

    syntaxHighlight(json: string) {
        json = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls : String = "number";
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = "key";
                } else {
                    cls = "string";
                }
            } else if (/true|false/.test(match)) {
                cls = "boolean";
            } else if (/null/.test(match)) {
                cls = "null";
            }
            return "<span class='" + cls + "'>" + match + "</span>";
        });
    }
}