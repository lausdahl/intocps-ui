///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />

import {IntoCpsApp} from  "../IntoCpsApp"
import {SettingKeys} from "../settings/SettingKeys";

import Path = require('path');
import fs = require('fs');

import downloader = require("../downloader/Downloader");

function createPanel(title: string, content: HTMLElement): HTMLElement {
    var divPanel = document.createElement("div");
    divPanel.className = "panel panel-default";

    var divTitle = document.createElement("div");
    divTitle.className = "panel-heading";
    divTitle.innerText = title;

    var divBody = document.createElement("div");
    divBody.className = "panel-body";
    divBody.appendChild(content);

    divPanel.appendChild(divTitle);
    divPanel.appendChild(divBody);
    return divPanel;
}

function progress(state: any) {
    let pct = parseInt((state.percentage * 100) + "", 10);
    console.log(pct + "%");
    setProgress(pct);
}

//Set the progress bar 
function setProgress(progress: number) {
    var divProgress = <HTMLInputElement>document.getElementById("coe-progress");
    let tmp = progress.toString() + "%";

    divProgress.style.width = tmp;
    divProgress.innerHTML = tmp;
}

function fetchList() {
    var tool: any;
    let tempDir = IntoCpsApp.getInstance().getSettings().getValue(SettingKeys.INSTALL_TMP_DIR);
    if (tempDir == null || tempDir == undefined) {
        tempDir = Path.join(IntoCpsApp.getInstance().getActiveProject().getRootFilePath(), "downloads");
    }
    try {
        fs.mkdirSync(tempDir);
    } catch (e) { }

    var panel: HTMLInputElement = <HTMLInputElement>document.getElementById("tool-versions-panel");

    downloader.fetchVersionList().then(data => {
        console.log(JSON.stringify(data) + "\n");
        console.log("Fetching version 0.0.6");


        var divVersions = document.createElement("div");

        $.each(Object.keys(data), (j, key) => {
            var divStatus = document.createElement("div");
            //divStatus.className = "alert alert-danger";
            divStatus.innerHTML = data[key];
            divVersions.appendChild(divStatus);
        });
        panel.appendChild(createPanel("Versions", divVersions));
        return downloader.fetchVersion(data["0.0.6"]);
    }).then(function (data) {
        console.log(JSON.stringify(data) + "\n");

        var div = document.createElement("div");
        $.each(Object.keys(data.tools), (j, key) => {

            let tool = data.tools[key];
            var divTool = document.createElement("div");
            //divStatus.className = "alert alert-danger";
            divTool.innerHTML = tool.name + " (" + tool.version + ") - " + tool.description;
            div.appendChild(divTool);
        });
        panel.appendChild(createPanel("Tools in version: " + data.version, div));

        console.log("Downloading tool: Overture Tool Wrapper");
        panel.appendChild(createPanel("Downloading: Overture Tool Wrapper", document.createElement("div")));
        tool = data.tools.overtureToolWrapper;
        return downloader.downloadTool(tool, tempDir, progress);
    });
    /*.then(function (filePath) {
        console.log("Download complete: " + filePath);
        console.log("Unpacking tool");
        return downloader.installTool(tool, filePath, "installed");
    })
        .then(function () {
            console.log("Installation complete\n");
            return;
        }, function (error) {
            console.log(error);
        });*/

}

