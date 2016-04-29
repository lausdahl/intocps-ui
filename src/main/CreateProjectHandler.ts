///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>

import {IntoCpsApp} from "./IntoCpsApp"
import {IntoCpsAppEvents} from "./IntoCpsAppEvents"
export default class CreateProjectHandler {

    controller: IntoCpsApp;
    win: any = null;

    constructor(intoCpsApp: IntoCpsApp) {
        this.controller = intoCpsApp;
    }

    public install() {

        const electron = require('electron');

        // Module to create native browser window.
        const BrowserWindow = electron.BrowserWindow;


        //IPC handlers
        var ipcMain = require('electron').ipcMain
        ipcMain.on(IntoCpsAppEvents.OPEN_CREATE_PROJECT_WINDOW, (event, arg) => {
            console.log(arg);  // prints "ping"
            //event.sender.send('asynchronous-reply', 'pong');
            this.openCreateWindow();
        });


        ipcMain.on('new-project-create', (event, arg) => {
            console.log("new-project-create: Name: " + arg.name + " Path: " + arg.path);  // prints "ping"
            this.controller.createProject(arg.name, arg.path);
            this.win.close();
        });


    }

    public openCreateWindow() {

        const electron = require('electron');

        // Module to create native browser window.
        const BrowserWindow = electron.BrowserWindow;

        this.win = new BrowserWindow({ width: 300, height: 200, show: false });

        // Open the DevTools.
        //win.webContents.openDevTools();

        this.win.on('closed', function () {
            this.win = null;
        });

        this.win.loadURL('file://' + __dirname + '/../new-project.html');
        this.win.show();
    }

}
export {CreateProjectHandler}

