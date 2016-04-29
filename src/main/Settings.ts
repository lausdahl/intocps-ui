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
  intoCpsAppFolder: string;
  settingsFile: string;
  intoCpsDataObject: any = { "into-cps-settings-version": "0.0.1" };

  constructor(app: Electron.App, intoCpsAppFolder: string) {
    this.app = app;
    this.intoCpsAppFolder = intoCpsAppFolder;
    this.settingsFile = path.normalize(this.intoCpsAppFolder + "/settings.json");
  }

  initializeSettings() {
    // Check if file exists
    fs.lstat(this.settingsFile, (err, data) => {
      if (err || !data.isFile()) {
        console.log("Settings file does not exist. Creating the file " + this.settingsFile + ".");
        this.storeSettings();
      }
      else {
        console.log("Loading settings from" + this.settingsFile + ".");
        this.loadSettings();
      }
    });
  }
  
  public save()
  {
     this.storeSettings();
  }

  storeSettings() {
    fs.open(this.settingsFile, "w", (err, fd) => {
      if (err) {
        "The error: " + err + " happened when attempting to open the file: " + this.settingsFile + " for writing.";
      }
      else {
        fs.write(fd, JSON.stringify(this.intoCpsDataObject), (err) => {
          if (err) {
            console.log("Failed to write settings in : " + this.settingsFile + ".");
          }
          else{
            console.log("Stored settings in : " + this.settingsFile + ".");
          }
          fs.close(fd, (err) => {
            if (err) {
              console.log("Failed to close writing to the file: " + this.settingsFile + ".");
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
        console.log("Failed to read settings from file: " + this.settingsFile + ".");
        throw err;
      }
      else {        
        this.intoCpsDataObject = JSON.parse(data.toString());
        console.log("Finished loading settings.")
      }
    });
  }

  setSetting(key: string, value: any) {
    this.intoCpsDataObject[key] = value;
  }

  getSetting(key: string): any {
    return this.intoCpsDataObject[key];
  }

}

export {Settings}