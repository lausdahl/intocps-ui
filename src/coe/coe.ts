class CoeController {

    url: string = "http://localhost:8082/";

    statusCmd: string = "status/"
    createSessionCmd: string = "createSession";
    initializeSessionCmd: string = "initialize/";
    simulateCmd: string = "simulate/";
    resultCmd: string = "result";
    resultCmdZipType: string = "zip";
    destroyCmd: string = "destroy";

    configButton: HTMLButtonElement;
    remote: Electron.Remote;
    dialog: Electron.Dialog;
    configFilePath: HTMLInputElement;

    config: Object;

    sessionId = -1

    // Here we import the File System module of node
    private fs = require('fs');

    constructor() {
        this.remote = require("remote");
        this.dialog = this.remote.require("dialog");
    }

    initialize() {
        this.configFilePath = <HTMLInputElement>document.getElementById("configFileText");

        this.configFilePath.value = "/Users/kel/data/into-cps/intocps-coe/orchestration/coe/src/test/resources/online-models/watertank-c/config.json";
    }

    launchExplorer() {

        let dialogResult: string[] = this.dialog.showOpenDialog({ properties: ["openFile"] });
        if (dialogResult != undefined) {
            this.configFilePath.value = dialogResult[0];
        }
    }

    uploadFmus() {
        var _this = this;
        setTimeout(function () {

            var div = <HTMLInputElement>document.getElementById("coe-debug");

            div.innerHTML = "Fmus uploaded";
            _this.setProgress(10);

            _this.initializeCoe();

        }, 2000);


    }

    setDebugMessage(message: string) {
        var div = <HTMLInputElement>document.getElementById("coe-debug");
        div.innerHTML = message;
    }

    initializeCoe() {
        var _this = this;

        setTimeout(function () {

            _this.setDebugMessage("Initializing the COE");

            var dat = JSON.stringify(_this.config);
            let url = _this.url + _this.initializeSessionCmd + _this.sessionId;


            jQuery.ajax({
                url: url,
                type: "POST",
                data: dat,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function () {
                    _this.setProgress(20);
                    _this.start();
                }
            });


        }, 2000);

    }

    start() {

        var _this = this;

        var dat = JSON.stringify({ startTime: 0, endTime: 10 });
        let url = _this.url + _this.simulateCmd + _this.sessionId;

        _this.setDebugMessage("Starting simulation");

        jQuery.ajax({
            url: url,
            type: "POST",
            data: dat,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function () {
                _this.setProgress(30);
                _this.start();
            }
        }).fail(function(){
            
            console.error("error in simulation call");
             _this.setDebugMessage("Starting simulation: FAILED");
        });

    }

    simulate() {
        var _this = this;

        this.setProgress(0);


        this.fs.readFile(this.configFilePath.value, function (err: any, data: any) {
            if (err) {
                return console.error(err);
            }
            console.log("Asynchronous read: " + data.toString());
            var cfg = JSON.parse(data.toString());
            console.log(cfg);

            _this.config = cfg;

            var divCoeFmus = <HTMLInputElement>document.getElementById("coe-fmus");
            $.each(cfg.fmus, function (i, item) {
                var fmuBtn = <HTMLDivElement>document.createElement("div");
                divCoeFmus.appendChild(fmuBtn);
                fmuBtn.innerHTML = item;

            })

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

                _this.setProgress(5);
                _this.uploadFmus();

            });

    }

    setProgress(progress: number) {
        var divProgress = <HTMLInputElement>document.getElementById("coe-progress");
        let tmp = progress.toString() + "%";
        divProgress.style.width = tmp;
        divProgress.innerHTML = tmp;
    }

}
