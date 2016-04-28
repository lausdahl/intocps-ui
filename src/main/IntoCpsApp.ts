///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>


import fs = require('fs');
import Path = require('path');

import {ISettingsValues} from "./ISettingsValues.ts"
import {Settings} from "./Settings.ts"
import {IProject} from "./IProject.ts"
import {Project} from "./Project.ts"

export default class IntoCpsApp {
    app: Electron.App;

    settings: Settings;

    activeProject: IProject = null;

    constructor(app: Electron.App) {
        this.app = app;

        const path = require('path');
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

        //create settings

        this.settings = new Settings(app, intoCpsAppFolder);

        //Create intoCpsApp folder if it does not exist
        fs.lstat(intoCpsAppFolder, (err, data) => {
            if (err || !data.isDirectory()) {
                fs.mkdir(intoCpsAppFolder, (err) => {
                    if (err) {
                        console.log("The error: " + err + " occured when attempting to create the directory: " + intoCpsAppFolder + ".");
                        throw err;
                    }
                    else {
                        this.settings.initializeSettings();
                    }
                });
            }
            else {
                this.settings.initializeSettings();
            }
        });


    }

    public getSettings(): ISettingsValues {
        return this.settings;
    }

    public getActiveProject(): IProject {
        return this.activeProject;
    }

    public setActiveProject(project: IProject) {
        this.activeProject = project;
    }



    public createProject(name: string, path: string) {
        let project = new Project(name, path, Path.normalize(path + "/.project.json"));
        project.save();
        this.setActiveProject(project);
    }

    loadProject(path: string): IProject {
        let config = Path.normalize(path + "/.project.json");
        var content = fs.readFileSync(config, "utf8");
        var project = SerializationHelper.toInstance(new Project("", "", ""), content.toString());
        console.info("Project name is: " + project.getName());
        this.setActiveProject(project);
        return project;
    }


}

class SerializationHelper {
    static toInstance<T>(obj: T, json: string): T {
        var jsonObj = JSON.parse(json);

        /*     if (typeof obj["fromJSON"] === "function") {
                 obj["fromJSON"](jsonObj);
             }
             else {
                 for (var propName in jsonObj) {
                     obj[propName] = jsonObj[propName]
                 }
             }
     */
        return obj;
    }
}


export {IntoCpsApp}