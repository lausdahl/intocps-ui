///<reference path="../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../typings/browser/ambient/node/index.d.ts"/>


import fs = require('fs');
import Path = require('path');

import {ISettingsValues} from "./settings/ISettingsValues"
import {Settings} from "./settings/settings"
import {IProject} from "./proj/IProject"
import {Project} from "./proj/Project"
import {IntoCpsAppEvents} from "./IntoCpsAppEvents";
import {SettingKeys} from "./settings//SettingKeys";

// constants
let topBarNameId : string = "activeTabTitle";

export default class IntoCpsApp {
    app: Electron.App;
    platform : String
    window: Electron.BrowserWindow;

    settings: Settings;

    activeProject: IProject = null;

    constructor(app: Electron.App, processPlatform: String) {
        this.app = app;
        this.platform = processPlatform;

        const intoCpsAppFolder = this.createAppFolderRoot(app);
        this.createDirectoryStructure(intoCpsAppFolder);
        //create settings
        this.settings = new Settings(app, intoCpsAppFolder);
        this.settings.load()

        let fs = require('fs');
        let activeProjectPath = this.settings.getSetting(SettingKeys.ACTIVE_PROJECT);
        try {
            if (!fs.accessSync(activeProjectPath, fs.R_OK)) {

                this.activeProject = this.loadProject(activeProjectPath);
            } else {
                console.error("Could not read the active project path from settings: " + activeProjectPath);
            }
        } catch (e) {
            console.warn(e);
            console.warn("Unable to set active project from settings: " + activeProjectPath)
        }
    }

    public setWindow(win: Electron.BrowserWindow) {
        this.window = win;
    }


    private createAppFolderRoot(app: Electron.App): string {
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

        return path.normalize(userPath + "/intoCpsApp");
    }

    private createDirectoryStructure(path: string) {
        try {
            fs.mkdirSync(path);
        } catch (e) {
            //the path probably already existed
        }
    }

    public getSettings(): ISettingsValues {
        return this.settings;
    }

    public getActiveProject(): IProject {
        return this.activeProject;
    }

    public setActiveProject(project: IProject) {

        if (project == null)
            return;

        this.activeProject = project;

        //Fire an event to inform all controlls on main window that the project has changed
        this.fireEvent(IntoCpsAppEvents.PROJECT_CHANGED);


        this.settings.setSetting(SettingKeys.ACTIVE_PROJECT, project.getProjectConfigFilePath());
        this.settings.save();
    }


    // Fires an ipc event using the window webContent if defined
    private fireEvent(event: string) {
        if (this.window != undefined) {
            //Fire an event to inform all controlls on main window that the project has changed
            this.window.webContents.send(IntoCpsAppEvents.PROJECT_CHANGED);
            // console.info("Window: " + this.window);
            console.info("fire event: " + event);
        }
    }


    public createProject(name: string, path: string) {
        let project = new Project(name, path, Path.normalize(path + "/.project.json"));
        project.save();
        this.setActiveProject(project);
    }

    loadProject(path: string): IProject {
        console.info("Loading project from: " + path)
        let config = Path.normalize(path);
        var content = fs.readFileSync(config, "utf8");
        //TODO load configuration containers and config files
        var project = SerializationHelper.toInstance(new Project("", "", ""), content.toString());
        //console.info("Loaded project: " + project);
        //console.info("Project name is: " + project.getName());
        return project;
    }

    public static setTopName(s:string){
      var mainName = (<HTMLSpanElement>document.getElementById(topBarNameId));
      mainName.innerText = s;
    };


}

// http://stackoverflow.com/questions/29758765/json-to-typescript-class-instance
class SerializationHelper {
    static toInstance<T>(obj: T, json: string): T {
        var jsonObj = JSON.parse(json);

        if (typeof (<any>obj)["fromJSON"] === "function") {
             (<any>obj)["fromJSON"](jsonObj);
        }
        else {
            for (var propName in jsonObj) {
                 (<any>obj)[propName] = jsonObj[propName]
            }
        }

        return obj;
    }
}


export {IntoCpsApp}
