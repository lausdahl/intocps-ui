'use strict';

const electron = require('electron');
const fs = require('fs');
const path = require('path');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Path to userData
const userDataPath = function(){
  if (app.getPath("exe").indexOf("electron-prebuilt") > -1) {
    console.log("Dev-mode: Using " + __dirname + " as user data path.")
    return __dirname;
  }
  else
    return app.getPath('userData');
} ()
const intoCpsFolder = path.normalize(userDataPath + "/intocps-ui");
const settingsFile = path.normalize(intoCpsFolder + "/settings.json");
//TODO: Return promise from settings functions?
global.intoCps = {
  data: {},
  getDefaultDirectory: function () {
    return userDataPath;
  },
  storeSettings: function () {
    fs.open(settingsFile, "w", (err, fd) => {
      if (err) {
        "The error: " + err + " happened when attempting to open the file: " + settingsFile;
      }
      else {
        fs.write(fd, JSON.stringify(global.intoCps.data), (err) => {
          if (err) {
            console.log("Failed to write settings to file: " + settingsFile);
          }
          fs.close(fd, (err) => {
            if (err) {
              console.log("Failed to close writing to the file: " + settingsFile);
              throw err;
            }
          });
        });
      }
    });
  },
  loadSettings: function () {
    fs.readFile(settingsFile, (err, data) => {
      if (!err) {
        global.intoCps.data = JSON.parse(data);
        console.log("Loaded settings: " + JSON.stringify(global.intoCps.data));
      }
      else {
        console.log("The error: " + err + " happened when attempting to load the file: " + settingsFile);
        throw err;
      }
    });
  }
}

function initializeSettings() {
  // Check if file exists
  fs.lstat(settingsFile, function (err, data) {
    if (err || !data.isFile()) {
      console.log("Settings file does not exist. Creating " + settingsFile);
      fs.mkdir(intoCpsFolder, (err) => {
        if (err) {
          console.log("The error: " + err + " happened when attempting to create the directory: " + intoCpsFolder);
          throw err;
        }
        else {
          global.intoCps.storeSettings();
        }
      });
    }
    else {
      global.intoCps.loadSettings();
    }
  });
}
initializeSettings();

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
