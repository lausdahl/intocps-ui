'use strict';

const electron = require('electron');
const fs = require('fs');
const path = require('path');


var settings = require("./main/Settings.js").default;
var IntoCpsApp = require("./main/IntoCpsApp.js").default;
var CreateProjectHandler = require("./main/CreateProjectHandler").default;
//var IntoCpsApp = require('IntoCpsApp');

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

let intoCpsApp = new IntoCpsApp(app);

global.intoCpsApp = intoCpsApp;

var createProjectHandler = new CreateProjectHandler(global.intoCpsApp);

// Definitions needed for menu construction
var defaultMenu = require('electron-default-menu')
var Menu = require('menu')


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

  intoCpsApp.setWindow(mainWindow);


  // Get template for default menu 
  var menu = defaultMenu()


  let mw = mainWindow;

  // Add custom menu 
  menu.splice(4, 0, {
    label: 'Into-Cps-App',
    submenu: [

      {
        label: 'New Project',
        click: function (item, focusedWindow) {
          createProjectHandler.openCreateWindow();
        }

      }
    ]
  })

  // Set top-level application menu, using modified template 
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

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



createProjectHandler.install();