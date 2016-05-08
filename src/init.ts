
import {IntoCpsAppEvents} from "./IntoCpsAppEvents";
import * as IntoCpsApp from  "./IntoCpsApp"
import {CoeController} from  "./coe/coe";
import {MmController} from  "./multimodel/MmController";
import {BrowserController} from "./proj/projbrowserview"
import {IntoCpsAppMenuHandler} from "./IntoCpsAppMenuHandler"

import fs = require('fs');

import {eventEmitter} from "./Emitter";

// constants
var mainViewId: string = "mainView";

class InitializationController {
    layout: W2UI.W2Layout;
    title: HTMLTitleElement;
    mainView: HTMLDivElement;
    constructor() {
        $(document).ready(() => this.initialize());
    }
    initialize() {
        this.setTitle();
        this.configureLayout();
        this.loadViews();
    }
    private configureLayout() {
        let layout: HTMLDivElement = <HTMLDivElement>document.querySelector("#layout");
        var pstyle = 'border: 1px solid #dfdfdf; padding: 5px; background-color: #FFFFFF';
        var topHtml = ""
        this.layout = $(layout).w2layout({
            name: 'layout',
            padding: 4,
            panels: [
                { type: 'left', size: 200, resizable: true, style: pstyle },
                { type: 'main', style: pstyle },
            ]
        });
    }
    private setTitle() {
        //Set the title to the project name
        this.title = <HTMLTitleElement>document.querySelector('title');
        let app: IntoCpsApp.IntoCpsApp = require("remote").getGlobal("intoCpsApp");
        if (app.getActiveProject() != null) {
            this.title.innerText = "Project: " + app.getActiveProject().getName();
        }
        let ipc: Electron.IpcRenderer = require('electron').ipcRenderer;
        ipc.on(IntoCpsAppEvents.PROJECT_CHANGED, (event, arg) => {
            this.title.innerText = "Project: " + app.getActiveProject().getName();
        });
    }

    private loadViews() {
        this.layout.load("main", "main.html", "", () => {
            /// Switch active tab marker
            $('.navbar li').click(function (e) {
                $('.navbar li.active').removeClass('active');
                var $this = $(this);
                if (!$this.hasClass('active')) {
                    $this.addClass('active');
                }
            });
            this.mainView = (<HTMLDivElement>document.getElementById(mainViewId));
            //this.loadCoSim();
        });
        this.layout.load("left", "proj/projbrowserview.html", "", () => {
            browserController.initialize();
        });
    }
    loadDse() {
        $(this.mainView).load("dse/dse.html");  // fire initialise event here
    }

    loadCoSim() {
        $(this.mainView).load("coe/coe.html", (event: JQueryEventObject) => coeController.initialize());
    }

    loadMc() {
        $(this.mainView).load("mc/mc.html") // fire initialise event here
    }
};





// Initialise controllers so they persist
let coeController: CoeController = new CoeController();
let mmController: MmController = new MmController();

let menuHandler: IntoCpsAppMenuHandler = new IntoCpsAppMenuHandler();



var browserController: BrowserController = new BrowserController(menuHandler);
var init = new InitializationController();

menuHandler.openCoeView = (path) => {
    $(init.mainView).load("coe/coe.html", (event: JQueryEventObject) => {
        coeController.initialize();
        coeController.load(path);
    });

};

menuHandler.openMultiModel = (path) => {
    $(init.mainView).load("multimodel/multimodel.html", (event: JQueryEventObject) => {
        mmController.initialize();
        mmController.load(path);
    });
};

menuHandler.openSysMlExport = () => {
    $(init.mainView).load("sysmlexport/sysmlexport.html");
};

menuHandler.openFmu = () => {
    $(init.mainView).load("fmus/fmus.html");
};


menuHandler.createMultiModel = (path) => {
    $(init.mainView).load("multimodel/multimodel.html", (event: JQueryEventObject) => {
        mmController.initialize();

        let remote = require("remote");
        let app: IntoCpsApp.IntoCpsApp = remote.getGlobal("intoCpsApp");

        let project = app.getActiveProject();
        if (project != null) {
            let content = fs.readFileSync(path, "UTF-8");
            let mmPath = project.createMultiModel("mm-" + Math.floor(Math.random() * 100), content);
            mmController.load(mmPath + "");
            eventEmitter.emit(IntoCpsAppEvents.PROJECT_CHANGED);

        }


    });
};

menuHandler.createCoSimConfiguration = (path) => {
    $(init.mainView).load("coe/coe.html", (event: JQueryEventObject) => {
        coeController.initialize();

        let remote = require("remote");
        let app: IntoCpsApp.IntoCpsApp = remote.getGlobal("intoCpsApp");

        let project = app.getActiveProject();
        if (project != null) {

            let coePath = project.createCoSimConfig(path + "", "co-sim-" + Math.floor(Math.random() * 100), null);
           
            coeController.load(coePath+"");
            eventEmitter.emit(IntoCpsAppEvents.PROJECT_CHANGED);
        }


    });
};
