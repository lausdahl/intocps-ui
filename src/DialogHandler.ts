///<reference path="../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../typings/browser/ambient/node/index.d.ts"/>


export default class DialogHandler {

    doAction: (arg: any) => void;
    htmlPath: string;
    ipcDoActionEventName: string;
    ipcOpenEventName: string;
    windowWidth: number;
    windowHeight: number;

    win: any = null;

    constructor(htmlPath: string, windowWidth: number,
        windowHeight: number, ipcOpenEventName: string, ipcDoActionEventName: string, doAction: (arg: any) => void) {
        this.htmlPath = htmlPath;
        this.windowWidth = windowWidth;
        this.windowHeight = windowHeight;
        this.ipcDoActionEventName = ipcDoActionEventName;
        this.doAction = doAction;
        this.ipcOpenEventName = ipcOpenEventName;
    }

    public install() {

        //IPC handlers
        var ipcMain = require('electron').ipcMain;

        if (this.ipcOpenEventName != null) {

            ipcMain.on(this.ipcOpenEventName, (event, arg) => {
                console.log(arg);  // prints "ping"
                //event.sender.send('asynchronous-reply', 'pong');
                this.openWindow();
            });
        }

        if (this.ipcDoActionEventName != null) {
            ipcMain.on(this.ipcDoActionEventName, (event, arg) => {
                this.doAction(arg);
                this.win.close();
            });
        }

    }

    public openWindow() {

        const electron = require('electron');

        // Module to create native browser window.
        const BrowserWindow = electron.BrowserWindow;

        this.win = new BrowserWindow({ width: this.windowWidth, height: this.windowHeight, show: false });

        // Open the DevTools.
        //win.webContents.openDevTools();

        this.win.on('closed', function () {
            this.win = null;
        });

        this.win.loadURL('file://' + __dirname + '/' + this.htmlPath);
        this.win.show();
    }

}
export {DialogHandler}

