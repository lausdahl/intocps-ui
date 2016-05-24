
import {IntoCpsAppEvents} from "./IntoCpsAppEvents";
import {IntoCpsApp} from  "./IntoCpsApp";
import {CoeController} from  "./coe/coe";
import {MmController} from  "./multimodel/MmController";
import {DseController} from  "./dse/dse";
import {CreateRTTesterProjectController} from  "./rttester/CreateRTTesterProject";
import {BrowserController} from "./proj/projbrowserview";
import {IntoCpsAppMenuHandler} from "./IntoCpsAppMenuHandler";
import {SourceDom} from "./sourceDom";
import {IViewController} from "./iViewController";
import {IProject} from "./proj/IProject";

import fs = require("fs");

import {eventEmitter} from "./Emitter";


class InitializationController {
    // constants
    mainViewId: string = "mainView";
    layout: W2UI.W2Layout;
    title: HTMLTitleElement;
    mainView: HTMLDivElement;
    
    constructor() {
        $(document).ready(() => this.initialize());
    }
    private initialize() {
        this.setTitle();
        this.configureLayout();
        this.loadViews();
    }
    private configureLayout() {
        let layout: HTMLDivElement = <HTMLDivElement>document.querySelector("#layout");
        let pstyle = "border: 1px solid #dfdfdf; padding: 5px; background-color: #FFFFFF";
        this.layout = $(layout).w2layout({
            name: "layout",
            padding: 4,
            panels: [
                { type: "left", size: 200, resizable: true, style: pstyle },
                { type: "main", style: pstyle },
            ]
        });
    }
    private setTitle() {
        // Set the title to the project name
        this.title = <HTMLTitleElement>document.querySelector("title");
        let app: IntoCpsApp = IntoCpsApp.getInstance();
        let p = app.getActiveProject();
        if (p != null) {
            this.title.innerText = "Project: " + p.getName() + " - "+p.getRootFilePath();
        }
        let ipc: Electron.IpcRenderer = require("electron").ipcRenderer;
        ipc.on(IntoCpsAppEvents.PROJECT_CHANGED, (event, arg) => {
            let p = app.getActiveProject();
            this.title.innerText = "Project: " + p.getName() + " - "+p.getRootFilePath();
        });
    }

    private loadViews() {
        this.layout.load("main", "main.html", "", () => {
            this.mainView = (<HTMLDivElement>document.getElementById(this.mainViewId));
        });
        this.layout.load("left", "proj/projbrowserview.html", "", () => {
            browserController.initialize();
        });
    }
};

// Initialise controllers
let menuHandler: IntoCpsAppMenuHandler = new IntoCpsAppMenuHandler();
let browserController: BrowserController = new BrowserController(menuHandler);
let init = new InitializationController();
let controller: IViewController;

function openViewController(htmlPath: string, path: string, controllerPar: new (mainDiv: HTMLDivElement) => IViewController) {
    $(init.mainView).load(htmlPath, (event: JQueryEventObject) => {
        controller = new controllerPar(init.mainView);
        if (controller.initialize) {
            controller.initialize(new SourceDom(path));
        }
    });
}

menuHandler.deInitialize = () => {
    if(controller != null && controller.deInitialize)
    {return controller.deInitialize();}
    else
    {return true;}
    
}

menuHandler.openCoeView = (path) => {
    openViewController("coe/coe.html", path, CoeController);
    };

menuHandler.openMultiModel = (path) => {
    openViewController("multimodel/multimodel.html", path, MmController);
};

menuHandler.createRTTesterProject = (path) => {
    $(init.mainView).load("rttester/CreateRTTesterProject.html", (event: JQueryEventObject) => {
        controller = new CreateRTTesterProjectController(init.mainView, path);
    });
};

menuHandler.openSysMlExport = () => {
    $(init.mainView).load("sysmlexport/sysmlexport.html");
    IntoCpsApp.setTopName("SysML Export");
};

menuHandler.openFmu = () => {
    $(init.mainView).load("fmus/fmus.html");
    IntoCpsApp.setTopName("FMUs");
};

menuHandler.openDseView = (path) => {
    openViewController("dse/dse.html", path, DseController);
};

menuHandler.createDse = (path) =>{
    $(init.mainView).load("dse/dse.html", (event: JQueryEventObject) => {
      // create empty DSE file and load it.
       menuHandler.openDseView("")
    });
};

menuHandler.createMultiModel = (path) => {
    $(init.mainView).load("multimodel/multimodel.html", (event: JQueryEventObject) => {
        let project: IProject = require("remote").getGlobal("intoCpsApp").getActiveProject();
        if (project != null) {
            let content = fs.readFileSync(path, "UTF-8");
            let mmPath = project.createMultiModel("mm-" + Math.floor(Math.random() * 100), content);
            menuHandler.openMultiModel(mmPath + "");
            eventEmitter.emit(IntoCpsAppEvents.PROJECT_CHANGED);
        }
    });
};

menuHandler.createCoSimConfiguration = (path) => {
    $(init.mainView).load("coe/coe.html", function (event: JQueryEventObject) {
        let project: IProject = require("remote").getGlobal("intoCpsApp").getActiveProject();
        if (project != null) {
            let coePath: string = project.createCoSimConfig(path + "", "co-sim-" + Math.floor(Math.random() * 100), null).toString();
            menuHandler.openCoeView(coePath);
            eventEmitter.emit(IntoCpsAppEvents.PROJECT_CHANGED);
        }


    });
};
