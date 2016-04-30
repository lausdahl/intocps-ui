'use strict';

const electron = require('electron');
const fs = require('fs');
const path = require('path');
var settings = require("./main/Settings.js").default;

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Create intoCpsApp folder
const userPath = function () {
  if (app.getPath("exe").indexOf("electron-prebuilt") > -1) {

    console.log("Dev-mode: Using " + __dirname + " as user data path.")
    return __dirname;
  }
  else {
    return app.getPath('userData');
  }
} ();
const intoCpsAppFolder = path.normalize(userPath + "/intoCpsApp");

global.intoCpsApp = {
  "settings": new settings(app, intoCpsAppFolder),
  "platform" : process.platform
}

//Create intoCpsApp folder if it does not exist
fs.lstat(intoCpsAppFolder, (err, data) => {
  if (err || !data.isDirectory()) {
    fs.mkdir(intoCpsAppFolder, (err) => {
      if (err) {
        console.log("The error: " + err + " occured when attempting to create the directory: " + this.intoCpsAppFolder  + ".");
        throw err;
      }
      else {
        global.intoCpsApp.settings.initializeSettings();
      }
    });
  }
  else {
    global.intoCpsApp.settings.initializeSettings();
  }
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
