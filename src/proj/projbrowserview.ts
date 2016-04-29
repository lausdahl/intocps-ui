//TODO: DUMMY REFERENCE UNTIL CHART MAKES A TYPESCRIPT DEFINITION FILE!

///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>

import {IntoCpsAppEvents} from "./main/IntoCpsAppEvents";
import * as IntoCpsApp from  "./main/IntoCpsApp"

var ipc = require('electron').ipcRenderer;
ipc.on(IntoCpsAppEvents.PROJECT_CHANGED, function (event, arg) {
    var element = <HTMLElement>document.getElementById("current-project-header");

    let remote = require("remote");
    let app: IntoCpsApp.IntoCpsApp = remote.getGlobal("intoCpsApp");

    element.innerText = "Project: "+app.getActiveProject().getName();
});