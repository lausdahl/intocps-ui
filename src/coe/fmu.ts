///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
export class Fmu {
    index: number;
    fmuName: HTMLLabelElement;
    path: string;
    html: HTMLDivElement;
    browseButton: HTMLButtonElement;
    pathTextField: HTMLInputElement
    dialog: Electron.Dialog;
    constructor(index: number, html: HTMLDivElement, fmuName?: string, path?: string) {
        this.index = index;
        this.html = html;
        this.path = path;
        this.browseButton = <HTMLButtonElement>this.html.querySelector("#fmuBrowseBut");
        this.pathTextField = <HTMLInputElement>this.html.querySelector("#fmuPath");
        this.fmuName = <HTMLLabelElement>this.html.querySelector("#fmuName");
        if(this.fmuName != null)
        {
            this.fmuName.innerText = fmuName;
        }
        this.dialog = require("remote").require("dialog");
        this.addOnClickHandler();
    }

    addOnClickHandler() {
        this.browseButton.onclick = (e) => {
            let dialogResult: string[] = this.dialog.showOpenDialog({ properties: ["openDirectory"] });
            if (dialogResult != null) {
                this.pathTextField.value = dialogResult[0];
            }
        }
    }
}