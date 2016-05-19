

function launchProjectExplorer() {
    let remote = require("remote");
    let dialog = remote.require("dialog");
    let dialogResult: string[] = dialog.showOpenDialog({ properties: ["openDirectory","createDirectory"] });
    if (dialogResult != undefined) {

        var p: HTMLInputElement = <HTMLInputElement>document.getElementById("projectRootPathText");
        p.value = dialogResult[0];
        //       this.app.createProject("my project",this.projectRootPath.value);
    }


}



function createProject() {
    var ipc = require('electron').ipcRenderer;
    console.log("Project created");

    var p: HTMLInputElement = <HTMLInputElement>document.getElementById("projectRootPathText");
    var n: HTMLInputElement = <HTMLInputElement>document.getElementById("name");

    ipc.send('new-project-create', { name: n.value, path: p.value });
}

