//TODO: DUMMY REFERENCE UNTIL CHART MAKES A TYPESCRIPT DEFINITION FILE!

///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jstree/index.d.ts"/>

import {IntoCpsAppEvents} from "../main/IntoCpsAppEvents";
import * as IntoCpsApp from  "../main/IntoCpsApp"

export class BrowserController {
    browser: HTMLDivElement;
    initialize() {
        this.browser = <HTMLDivElement>document.querySelector("#browser");
        let remote = require("remote");
        let app: IntoCpsApp.IntoCpsApp = remote.getGlobal("intoCpsApp");
        if (app.getActiveProject() != null) {
            var element = <HTMLElement>document.getElementById("current-project-header");
            element.innerText = "Project: " + app.getActiveProject().getName();
        }
        var ipc = require('electron').ipcRenderer;
        ipc.on(IntoCpsAppEvents.PROJECT_CHANGED, function (event, arg) {
            var element = <HTMLElement>document.getElementById("current-project-header");
            element.innerText = "Project: " + app.getActiveProject().getName();
        });
        this.initializeTree(this.browser);
    }
    initializeTree(browser: HTMLDivElement) {
        $(browser).w2sidebar({
            name: 'sidebar',
            topHTML: '<h1 id="current-project-header"> Project Browser</h1>',
            nodes: [
                {
                    id: 'Models', text: 'Models', img: 'icon-folder', expanded: true, group: true
                },
                {
                    id: 'FMUs', text: 'FMUs', img: 'icon-folder', expanded: true, group: true
                },
                {
                    id: 'Connections', text: 'Connections', img: 'icon-folder', expanded: true, group: true
                },
                {
                    id: 'Multi-Models', text: 'Multi-Models', img: 'icon-folder', expanded: true, group: true,
                    nodes: [{
                        id: 'Multi-Models-1', text: 'Multi-Model1', icon: 'glyphicon glyphicon-folder-open',
                        nodes: [
                            {
                                id: 'Multi-Models-1-1', text: 'SimWithControllerModeX', icon: 'glyphicon glyphicon-file',
                                nodes: [
                                    { id: 'MM-1-1-1', text: 'Timestamp', icon: 'icon-page' },
                                    { id: 'MM-1-1-2', text: 'Timestamp', icon: 'icon-page' }]
                            },
                            {
                                id: 'Multi-Models-1-2', text: 'SimWithControllerModeZ', icon: 'glyphicon glyphicon-file',
                                nodes: [
                                    { id: 'MM-1-2-1', text: 'Timestamp', icon: 'icon-page' },
                                    { id: 'MM-1-2-2', text: 'Timestamp', icon: 'icon-page' }]
                            },
                            {
                                id: 'Multi-Models-1-3', text: 'SimWithControllerModeY', icon: 'glyphicon glyphicon-file',
                                nodes: [
                                    { id: 'MM-1-3-1', text: 'Timestamp', icon: 'icon-page' },
                                    { id: 'MM-1-3-2', text: 'Timestamp', icon: 'icon-page' }]
                            }]

                    },
                        {
                            id: 'Multi-Models-2', text: 'Multi-Model2', icon: 'glyphicon glyphicon-folder-open',
                            nodes: [
                                {
                                    id: 'Multi-Models-2-1', text: 'SimWithControllerModeK', icon: 'glyphicon glyphicon-file',
                                    nodes: [
                                        { id: 'MM-1-1-1', text: 'Timestamp', icon: 'icon-page' }]
                                }]

                        }
                    ]
                },
                {
                    id: 'Design Space Explorations', text: 'Design Space Explorations', img: 'icon-folder', expanded: true, group: true,
                    nodes: [{
                        id: 'DSE-1', text: 'SimWithControllerX', icon: 'glyphicon glyphicon-file',
                        nodes: [{ id: 'DSE-1-1', text: 'Timestamp', icon: 'icon-page' }]
                    }]
                }
                
            ]
        });
    }
}