import {CoeController} from  "./coe/coe";

//Split layout in 2
var myLayout;
$(document).ready(function(){
    myLayout = $(document.body).layout({
        west__minSize:	50
    });
});

// Load project view in left view
var left : HTMLDivElement = (<HTMLDivElement>document.getElementById("leftView"));
$(left).load("proj/projbrowserview.html");

// Load Co-Sim in view in the main view 
var coeController = new CoeController();
var div : HTMLDivElement = (<HTMLDivElement>document.getElementById("mainView"));
$(div).load("coe/coe.html", (event : JQueryEventObject) => coeController.initialize());

