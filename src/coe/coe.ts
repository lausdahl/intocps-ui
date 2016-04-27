//TODO: DUMMY REFERENCE UNTIL CHART MAKES A TYPESCRIPT DEFINITION FILE!
///<reference path="Chart.d.ts"/>
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
import Settings from "./../main/Settings.ts"
class CoeController {

    url: string = "http://localhost:8082/";

    statusCmd: string = "status/"
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

    public chartIds: string[] = [];

    // Here we import the File System module of node
    private fs = require('fs');

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
        let dialogResult: string[] = this.dialog.showOpenDialog({ properties: ["openDirectory"] });
        if (dialogResult != undefined) {
            this.projectRootPath.value = dialogResult[0];
        }


    }

    getConfigFile(): string {
        return this.projectRootPath.value + "/" + this.configFileName;
    }


    uploadFmus() {
        var _this = this;

        var div = <HTMLInputElement>document.getElementById("coe-debug");

        var res = _this.parseConfig(_this.getConfigFile());

        var message = "Uploading Fmu: "
        div.innerHTML = message;
        _this.setProgress(_this.progressState, "Uploading Fmus");

        var formData = new FormData();

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

            var content = _this.fs.readFileSync(filePath);
            var blob = new Blob([content], { type: "multipart/form-data" });

            formData.append('file', blob, path);



        })

        let url = _this.url + _this.uploadCmd + _this.sessionId;

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

    setDebugMessage(message: string) {
        var div = <HTMLInputElement>document.getElementById("coe-debug");
        div.innerHTML = message;
    }

    initializeCoe() {
        var _this = this;

        _this.setDebugMessage("Initializing the COE");
        _this.setProgress(_this.progressState, "Initializing the COE");

        var dat = JSON.stringify(_this.config);
        let url = _this.url + _this.initializeSessionCmd + _this.sessionId;


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
        callback.chartIds = this.chartIds;

        var _this = this;

        var dat = JSON.stringify({ startTime: 0, endTime: 10 });
        let url = _this.url + _this.simulateCmd + _this.sessionId;

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

        try {
            if (this.fs.accessSync(path, this.fs.R_OK)) {
                return null;
            }
            var content = this.fs.readFileSync(path, "utf8");
            console.log("Asynchronous read: " + content.toString());
            var cfg = JSON.parse(content.toString());
            console.log(cfg);
            return cfg;
        } catch (e) {
        }
        return null;

    }

    launch() {
        var _this = this;

        // _this.setProgress(15, "Creating session");
        _this.setProgress(0, null);

        var cfg = _this.parseConfig(_this.getConfigFile());
        if (cfg == null) {
            alert("Could not read simulation config.json from project root");
            return console.error("Unable to parse config file: " + _this.getConfigFile());

        }

        _this.config = cfg;

        _this.chartIds = _this.initializeChartDatasets(cfg.livestream);

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

    get_random_color() {
        function c() {
            var hex = Math.floor(Math.random() * 256).toString(16);
            return ("0" + String(hex)).substr(-2); // pad with zero
        }
        return "#" + c() + c() + c();
    }


    initializeChartDatasets(livestreams: any): string[] {
        let _this = this;
        var ids: string[] = [];

        // $.each(livestreams, function (i, item) {

        var keys = Object.keys(livestreams);

        $.each(keys, function (j, key) {
            if (key.indexOf("{") == 0) {
                let preFix = key + ".";
                $.each(livestreams[key], function (k, output) {
                    let id = preFix + output;
                    ids.push(id);
                });
            }
        });

        console.log(ids);
        // _this.chartIds = ids;

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
        return ids;
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
    public chartIds: string[] = [];
    connect(url: string) {

        var websocket = new WebSocket(url);
        let _this = this;
        websocket.onopen = function (evt) { _this.onOpen(evt) };
        websocket.onclose = function (evt) { _this.onClose(evt) };
        websocket.onmessage = function (evt) { _this.onMessage(evt) };
        websocket.onerror = function (evt) { _this.onError(evt) };


        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = '.string { color: green; } .number { color: darkorange; } .boolean { color: blue; } .null { color: magenta; } .key { color: red; } ';
        document.getElementsByTagName('head')[0].appendChild(style);
    }

    onOpen(evt: any) {
        this.output("CONNECTED");
    }

    onClose(evt: any) {
        this.output('<span style="color: orange;">CLOSE: </span> ')
        this.output("DISCONNECTED");
    }

    onMessage(evt: any) {
        let _this = this;
        var jsonData = JSON.parse(evt.data);
        var str = JSON.stringify(jsonData, undefined, 4);
        this.output(this.syntaxHighlight(str));

        //calculate id

        $.each(Object.keys(jsonData), function (j, fmukey) {
            if (fmukey.indexOf("{") == 0) {
                let preFix = fmukey + ".";
                $.each(Object.keys(jsonData[fmukey]), function (k, instanceKey) {
                    let id = preFix + instanceKey + ".";
                    $.each(Object.keys(jsonData[fmukey][instanceKey]), function (j, outputKey) {
                        let key = id + outputKey;
                        var value = jsonData[fmukey][instanceKey][outputKey];
                        $.each(_this.chartIds, function (index, datasetKey) {
                            if (datasetKey == key) {

                                if (value == "true")
                                { value = 1 }
                                else if (value == "false")
                                { value = 0; }

                                _this.chart.data.datasets[index].data.push(value);

                            }
                        });
                    });
                });
            }
        });

        this.chart.update();
    }

    onError(evt: any) {
        this.output('<span style="color: red;">ERROR:</span> ' + evt.data);
    }

    output(inp: string) {

        let div = <HTMLInputElement>document.getElementById("coe-callback");

        let pre = document.createElement('pre');

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

        //document.body.appendChild(document.createElement('pre')).innerHTML = inp;
    }

    syntaxHighlight(json: string) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }
}