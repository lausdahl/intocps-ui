
import {IntoCpsAppEvents} from "./main/IntoCpsAppEvents";
import * as IntoCpsApp from  "./main/IntoCpsApp"
import {CoeController} from  "./coe/coe";
import {BrowserController} from "./proj/projbrowserview"

// constants
var mainViewId: string = "mainView";

class InitializationController {
    layout: W2UI.W2Layout;
    coeController: CoeController = new CoeController();
    browserController: BrowserController = new BrowserController();
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
        let app: IntoCpsApp.IntoCpsApp  = require("remote").getGlobal("intoCpsApp");
        if (app.getActiveProject() != null) {
            this.title.innerText = "Project: " + app.getActiveProject().getName();
        }
        let ipc : Electron.IpcRenderer = require('electron').ipcRenderer;
        ipc.on(IntoCpsAppEvents.PROJECT_CHANGED, function (event, arg) {
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
            this.loadCoSim();
        });
        this.layout.load("left", "proj/projbrowserview.html", "", () => {
            this.browserController.initialize();
        });
    }
    loadDse(){
        $(this.mainView).load("dse/dse.html");  // fire initialise event here
    }
    
    loadCoSim(){
          $(this.mainView).load("coe/coe.html", (event: JQueryEventObject) => this.coeController.initialize());
    }
    
    loadMc(){
        $(this.mainView).load("mc/mc.html") // fire initialise event here
    }
};

// Initialise controllers so they persist
var init = new InitializationController();
