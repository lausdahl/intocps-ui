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

function getTempDir(): string {
    let tempDir = IntoCpsApp.getInstance().getSettings().getValue(SettingKeys.INSTALL_TMP_DIR);
    if (tempDir == null || tempDir == undefined) {
        if (IntoCpsApp.getInstance().getActiveProject() == null) {
            let remote = require("remote");
            let dialog = remote.require("dialog");
            dialog.showErrorBox("No active project", "No Active project loaded, please load and try again.");
            return;
        }
        tempDir = Path.join(IntoCpsApp.getInstance().getActiveProject().getRootFilePath(), "downloads");
    }
    try {
        fs.mkdirSync(tempDir);
    } catch (e) { }
    return tempDir;
}

function progress(state: any) {
    if (state == 1) {
        setProgress(100);
        return;
    }
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

    var url = IntoCpsApp.getInstance().getSettings().getValue(SettingKeys.UPDATE_SITE);

    if (url == null || url == undefined) {
        url = "https://raw.githubusercontent.com/into-cps/release-site/master/download/";
        IntoCpsApp.getInstance().getSettings().setValue(SettingKeys.UPDATE_SITE, url);

    }

    var panel: HTMLInputElement = <HTMLInputElement>document.getElementById("tool-versions-panel");

    while (panel.hasChildNodes()) {
        panel.removeChild(panel.lastChild);
    }

    downloader.fetchVersionList(url + "versions.json").then(data => {
        //   console.log(JSON.stringify(data) + "\n");
        //   console.log("Fetching version 0.0.6");

        var versions: string[] = [];

        var divVersions = document.createElement("div");

        $.each(Object.keys(data), (j, key) => {
            let version = key;
            versions.push(version);
        });

        //sort
        versions = versions.sort(downloader.compareVersions);
        //highest version first
        versions = versions.reverse();


        var divVersions = document.createElement("div");

        versions.forEach(version => {
            var divStatus = document.createElement("div");
            divStatus.className = "alert alert-info";

            divStatus.innerHTML = version;/// +" - "data[version];
            divStatus.onclick = function (e) {
                downloader.fetchVersion(url + data[version]).then(dataVersion => {
                    showVersion(version, dataVersion);
                });
            };


            divVersions.appendChild(divStatus);
        });


        panel.appendChild(createPanel("Releases", divVersions));
        //return downloader.fetchVersion(data[versions[0]]);
    });

}

function showVersion(version: string, data: any) {

    var panel: HTMLInputElement = <HTMLInputElement>document.getElementById("tool-versions-panel");
    // var tool: any;
    // console.log(JSON.stringify(data) + "\n");

    var div = document.createElement("ul");
    div.className = "list-group";
    $.each(Object.keys(data.tools), (j, key) => {

        let tool = data.tools[key];

        var supported = false;
        let platform = downloader.getSystemPlatform();
        let platforms = tool.platforms;
        Object.keys(tool.platforms).forEach(pl => {
            if (pl.indexOf(platform) == 0) {
                supported = true;
            }
        });

        if (!supported)
            return;

        var divTool = document.createElement("li");
        divTool.className = "list-group-item";
        divTool.innerText = tool.name + " - " + tool.description + " (" + tool.version + ") ";
        div.appendChild(divTool);

        let btn = document.createElement("button");
        //button type="button" class="btn btn-default btn-sm"
        btn.type = "button";
        btn.className = "btn btn-default btn-sm";
        var icon = document.createElement("span");
        icon.className = "glyphicon glyphicon-save";
        btn.appendChild(icon);
        divTool.appendChild(btn);

        btn.onclick = function (e) {
            let remote = require("remote");
            let dialog = remote.require("dialog");
            let buttons: string[] = ["No", "Yes"];
            dialog.showMessageBox({ type: 'question', buttons: buttons, message: "Download: " + tool.name + " (" + tool.version + ")" }, function (button: any) {
                if (button == 1)//yes
                {
                    downloader.downloadTool(tool, getTempDir(), progress).then(function (filePath) {
                        console.log("Download complete: " + filePath);
                        dialog.showMessageBox({ type: 'info', buttons: ["OK"], message: "Download completed: " + filePath }, function (button: any) { });
                        //console.log("Unpacking tool");
                    });
                }
            });
        };
    });

    var divT = document.getElementById("toolsversion");
    if (divT == undefined) {
        divT = document.createElement("div");
        divT.id = "toolsversion";
        panel.appendChild(divT);
    }

    while (divT.hasChildNodes()) {
        divT.removeChild(divT.lastChild);
    }

    divT.appendChild(createPanel("Overview - Release: " + data.version, div));

    //console.log("Downloading tool: Overture Tool Wrapper");
    // panel.appendChild(createPanel("Downloading: Overture Tool Wrapper", document.createElement("div")));
    // tool = data.tools.overtureToolWrapper;
    //return downloader.downloadTool(tool, getTempDir(), progress);

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

