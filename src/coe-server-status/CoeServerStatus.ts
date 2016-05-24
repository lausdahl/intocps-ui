///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />

import {IntoCpsApp} from  "../IntoCpsApp"
import {SettingKeys} from "../settings/SettingKeys";
import * as COE from "../coe/coe";

import Path = require('path');
import fs = require('fs');

var globalCoeIsRunning = false;


window.onload = function () {
    COE.checkCoeConnection("coe-status", COE.getCoeUrl()).then(() => { });
};


function coeClose() {

    if (!globalCoeIsRunning) {
        return realClose();
    }

    let remote = require("remote");
    let dialog = remote.require("dialog");
    let buttons: string[] = ["No", "Yes"];
    dialog.showMessageBox({ type: 'question', buttons: buttons, message: "Are you sure you want to terminate the COE" }, function (button: any) {
        if (button == 1)//yes
        {
            return realClose();
        }
    });
    return true;

}

function realClose() {
    window.top.close();
    return false;
}

function launchCoe() {

    var spawn = require('child_process').spawn;

    let installDir = IntoCpsApp.getInstance().getSettings().getValue(SettingKeys.INSTALL_TMP_DIR);
    let coePath = Path.join(installDir, "coe.jar");
    let childCwd = Path.join(installDir, "coe-working-dir");

    var mkdirp = require('mkdirp');
    mkdirp.sync(childCwd);

    var child = spawn('java', ['-jar', coePath], {
        detached: true,
        shell: true,
        cwd: childCwd
    });
    child.unref();
    globalCoeIsRunning = true;

    let div = document.createElement("div");
    let panel = createPanel("Console", div);
    document.getElementById("coe-console").appendChild(panel);

    child.stdout.on('data', function (data: any) {
        console.log('stdout: ' + data);
        //Here is where the output goes
        let m = document.createElement("span");
        m.innerText = data + "";
        div.appendChild(m);
    });
    child.stderr.on('data', function (data: any) {
        console.log('stderr: ' + data);
        //Here is where the error output goes
        let m = document.createElement("span");
        // m.style.color="#d9534f";
        m.className = "text-danger";
        m.innerText = data + "";
        div.appendChild(m);
    });
    child.on('close', function (code: any) {
        console.log('closing code: ' + code);
        //Here you can get the exit code of the script
    });

    //    var fork = require("child_process").fork,
    //   child = fork(__dirname + "/start-coe.js");




}

function downloadLog(){
    
}

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


