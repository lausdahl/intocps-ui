class CoeController {
    configButton: HTMLButtonElement;
    remote: Electron.Remote;
    dialog: Electron.Dialog;
    configFilePath: HTMLInputElement;
    constructor() {
        this.remote = require("remote");
        this.dialog = this.remote.require("dialog");
    }

    initialize() {
        this.configFilePath = <HTMLInputElement>document.getElementById("configFileText");
    }

    launchExplorer() {
        let dialogResult: string[] = this.dialog.showOpenDialog({ properties: ["openFile"] });
        if (dialogResult != undefined) {
            this.configFilePath.value = dialogResult[0];
        }
    }
}

