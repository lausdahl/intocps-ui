///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>

import {IntoCpsApp} from "./IntoCpsApp"
import {IntoCpsAppEvents} from "./IntoCpsAppEvents"
export default class CreateProjectHandler {

    controller: IntoCpsApp;

    constructor(intoCpsApp: IntoCpsApp) {
        this.controller = intoCpsApp;
    }

    public install() {
        let _this = this;
        const electron = require('electron');

        // Module to create native browser window.
        const BrowserWindow = electron.BrowserWindow;

        var win: any = null;
        //IPC handlers
        var ipcMain = require('electron').ipcMain
        ipcMain.on(IntoCpsAppEvents.OPEN_CREATE_PROJECT_WINDOW, (event, arg) => {
            console.log(arg);  // prints "ping"
            //event.sender.send('asynchronous-reply', 'pong');
            win = new BrowserWindow({ width: 300, height: 200, show: false });

            // Open the DevTools.
            //win.webContents.openDevTools();

            win.on('closed', function () {
                win = null;
            });

            win.loadURL('file://' + __dirname + '/../new-project.html');
            win.show();
        });


        ipcMain.on('new-project-create', function (event, arg) {
            console.log("new-project-create: Name: " + arg.name + " Path: " + arg.path);  // prints "ping"
            _this.controller.createProject(arg.name, arg.path);
            win.close();
        });


    }



}
export {CreateProjectHandler}

