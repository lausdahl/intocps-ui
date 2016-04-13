var remote : Electron.Remote = require("remote");
var dialog : Electron.Dialog = remote.require("dialog");

function launchExplorer() {
    var dialogResult : string[] = dialog.showOpenDialog({properties : ['openFile']});
    var span = document.getElementById("configFileSpan");
    if(dialogResult != undefined){
        span.appendChild(document.createTextNode(dialogResult[0]));
    }
    else{
        while( span.firstChild ) {
            span.removeChild( span.firstChild );
        }
        span.appendChild( document.createTextNode("No file was chosen.") );
    }
}
