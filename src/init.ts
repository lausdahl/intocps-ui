function brag(b : string) {
    return "It's gonna be " + b +"!";
}
    var div : HTMLDivElement = (<HTMLDivElement>document.getElementById("topView"));
    // Example of how to load a page and wait until it is loaded
    $(div).load("top/topview.html");
var coeController = new CoeController();
function clickme() {
    var div : HTMLDivElement = (<HTMLDivElement>document.getElementById("mainViewDiv"));
    // Example of how to load a page and wait until it is loaded
    $(div).load("coe/coe.html", (event : JQueryEventObject) => coeController.initialize());
}

var adj = "awesome";

document.write(brag(adj));
