///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
/**
 * Settings
 */
import fs = require('fs');
import path = require('path');
import {ISettingsValues} from "./ISettingsValues.ts"

export default class Settings implements ISettingsValues {
  app: Electron.App;
  userDataPath: string;
  intoCpsFolder: string;
  settingsFile: string;
  intoCpsDataObject: any = { "dummy": "dummy" };

  constructor(app: Electron.App) {
    this.app = app;
    this.LoadUserDataPath();
    this.intoCpsFolder = path.normalize(this.userDataPath + "/intoCpsApp");
    this.settingsFile = path.normalize(this.intoCpsFolder + "/settings.json");
  }
  private LoadUserDataPath() {
    if (this.app.getPath("exe").indexOf("electron-prebuilt") > -1) {

      console.log("Dev-mode: Using " + __dirname + " as user data path.")
      this.userDataPath = __dirname;
    }
    else {
      this.userDataPath = this.app.getPath('userData');
    }
  }
  initializeSettings() {
    // Check if file exists
    fs.lstat(this.settingsFile, (err, data) => {
      if (err || !data.isFile()) {
        console.log("Settings file does not exist. Creating " + this.settingsFile);
        fs.lstat(this.intoCpsFolder, (err, data) => {
          if (err || !data.isDirectory()) {
            //Create intoCpsApp folder
            fs.mkdir(this.intoCpsFolder, (err) => {
              if (err) {
                console.log("The error: " + err + " happened when attempting to create the directory: " + this.intoCpsFolder);
                throw err;
              }
              else {
                this.storeSettings();
              }
            });
          }
          else {
            this.storeSettings();
          }
        })

      }
      else {
        console.log("Loading settings");
        this.loadSettings();
      }
    });
  }

  storeSettings() {
    fs.open(this.settingsFile, "w", (err, fd) => {
      if (err) {
        "The error: " + err + " happened when attempting to open the file: " + this.settingsFile;
      }
      else {
        fs.write(fd, JSON.stringify(this.intoCpsDataObject), (err) => {
          if (err) {
            console.log("Failed to write settings to file: " + this.settingsFile);
          }
          fs.close(fd, (err) => {
            if (err) {
              console.log("Failed to close writing to the file: " + this.settingsFile);
              throw err;
            }
          });
        });
      }
    });
  }
  loadSettings() {
    fs.readFile(this.settingsFile, (err, data) => {
      if (err) {
        console.log("Failed to read settings from file: " + this.settingsFile);
      }
      else {
        console.log("Loaded settings from: " + this.settingsFile);
        this.intoCpsDataObject = JSON.parse(data.toString());
      }
    });
  }

  setSetting(key: string, value: any) {
    this.intoCpsDataObject.key = value;
  }

  getSetting(key: string): any {
    return this.intoCpsDataObject.key;
  }

}