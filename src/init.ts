/// <reference path="../custom-typings/layout.d.ts"/>"

import {CoeController} from  "./coe/coe";

// constants
var mainViewId : string = "mainView";

// Initialise controllers so they persist
var coeController = new CoeController();
var myLayout : any;


/// Switch active tab marker
$('.navbar li').click(function(e) {
    $('.navbar li.active').removeClass('active');
    var $this = $(this);
    if (!$this.hasClass('active')) {
        $this.addClass('active');
    }
});


initLayout();


// Initialise layout
function initLayout(){ 
    $(document).ready(function(){
        myLayout = $(document.body).layout({
            west__minSize:	50
        });
    });
    var left : HTMLDivElement = (<HTMLDivElement>document.getElementById("leftView"));
    $(left).load("proj/projbrowserview.html");
    loadCoSim();
}

// Load DSE into main view
function loadDse() {
    var div : HTMLDivElement = (<HTMLDivElement>document.getElementById(mainViewId));
    $(div).load("dse/dse.html") // fire initialise event here
}

// Load Co-Sim into main view
function loadCoSim() {
    var div : HTMLDivElement = (<HTMLDivElement>document.getElementById(mainViewId));
    $(div).load("coe/coe.html",(event : JQueryEventObject) => coeController.initialize()); 
}

// Load MC into main view
function loadMc() {
    var div : HTMLDivElement = (<HTMLDivElement>document.getElementById(mainViewId));
    $(div).load("mc/mc.html") // fire initialise event here
}
