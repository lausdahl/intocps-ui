/// <reference path="../typings/browser/ambient/jquery.ui.layout/index.d.ts"/>"

import {CoeController} from  "./coe/coe";
import {BrowserController} from "./proj/projbrowserview"

// constants
var mainViewId: string = "mainView";

// Initialise controllers so they persist
var coeController = new CoeController();
var browserController = new BrowserController();
var myLayout: JQueryUILayout.Layout;
var layout: HTMLDivElement;



$(document).ready(function () {
    layout = <HTMLDivElement>document.querySelector("#layout");
    var pstyle = 'border: 1px solid #dfdfdf; padding: 5px; background-color: #FFFFFF';
    var topHtml = ""
    $(layout).w2layout({
        name: 'layout',
        padding: 4,
        panels: [
            { type: 'left', size: 200, resizable: true, style: pstyle },
            { type: 'main', style: pstyle },
        ]
    });
    //Load the main view
    w2ui['layout'].load("main", "main.html", "", function () {
        /// Switch active tab marker
        $('.navbar li').click(function (e) {
            $('.navbar li.active').removeClass('active');
            var $this = $(this);
            if (!$this.hasClass('active')) {
                $this.addClass('active');
            }
        });
        loadCoSim();
    });
    w2ui['layout'].load("left", "proj/projbrowserview.html", "", function () {
        browserController.initialize();

    });
});

// Load DSE into main view
function loadDse() {
    var div: HTMLDivElement = (<HTMLDivElement>document.getElementById(mainViewId));
    $(div).load("dse/dse.html") // fire initialise event here
}

// Load Co-Sim into main view
function loadCoSim() {
    var div: HTMLDivElement = (<HTMLDivElement>document.getElementById(mainViewId));
    $(div).load("coe/coe.html", (event: JQueryEventObject) => coeController.initialize());
}

// Load MC into main view
function loadMc() {
    var div: HTMLDivElement = (<HTMLDivElement>document.getElementById(mainViewId));
    $(div).load("mc/mc.html") // fire initialise event here
}
