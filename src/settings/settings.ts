/// <reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
/// <reference path="../../typings/browser/ambient/node/index.d.ts"/>
/**
 * Settings
 */
import fs = require("fs");
import path = require("path");
import {ISettingsValues} from "./ISettingsValues.ts";

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

  public save() {
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
          else {
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

  load() {
    try {

      let initial = false;
      try {
        if (!fs.statSync(this.settingsFile).isFile()) {
          initial = true;
        }
      } catch (e) {
        initial = true;
      }

      if (initial) { // no settings file created yet, just use DOM
        this.intoCpsDataObject = {};
        return;
      }

      this.intoCpsDataObject = JSON.parse(fs.readFileSync(this.settingsFile, "UTF-8"));
    } catch (e) {
      console.log("Failed to read settings from file: " + this.settingsFile + ".");
      throw e;
    }
    console.info(this.intoCpsDataObject);
    console.log("Finished loading settings.");
    /* fs.readFile(this.settingsFile, (err, data) => {
       if (err) {
         console.log("Failed to read settings from file: " + this.settingsFile + ".");
         throw err;
       }
       else {        
         this.intoCpsDataObject = JSON.parse(data.toString());
         console.info(this.intoCpsDataObject);
         console.log("Finished loading settings.");
       }
     });*/
  }
  
  setValue(key: string, value: any) {
    this.intoCpsDataObject[key] = value;
  }
  
  
  getValue(key: string): any {
    return this.intoCpsDataObject[key];
  }

  
  setSetting(key: string, value: any) {
    this.setValue(key,value);
  }

  getSetting(key: string): any {
    return this.getValue(key);
  }

}

export {Settings}