///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
export class Fmu {
    fmuName: HTMLLabelElement;
    html: HTMLElement;
    pathTextField: HTMLInputElement
    dialog: Electron.Dialog;
    constructor(html: HTMLElement, removeCallBack: (fmu: Fmu) => void, fmuName?: string, path?: string) {
        this.dialog = require("remote").require("dialog");

        this.html = html;

        this.pathTextField = <HTMLInputElement>this.html.querySelector("#fmuPath");
        if (path != null) {
            this.pathTextField.value = path;
        }

        this.fmuName = <HTMLLabelElement>this.html.querySelector("#fmuName");
        if (fmuName != null) {
            this.fmuName.innerText = fmuName;
        }
        
        let fileBrowseButton = <HTMLButtonElement>this.html.querySelector("#fmuFileBrowseBut");
        Fmu.addBrowseOnClickHandler(fileBrowseButton, this.pathTextField, this.dialog, ['openFile']);
        let dirBrowseButton = <HTMLButtonElement>this.html.querySelector("#fmuDirBrowseBut");
        Fmu.addBrowseOnClickHandler(dirBrowseButton, this.pathTextField, this.dialog, ['openDirectory']);
        let removeButton = <HTMLButtonElement>this.html.querySelector("#fmuRemoveBut");
        Fmu.addRemoveOnClickHandler(removeButton, removeCallBack, this);
    }
    getHtml(): HTMLElement {
        return this.html;
    }

    private static addBrowseOnClickHandler(button: HTMLButtonElement, txtField: HTMLInputElement, dialog: Electron.Dialog, props: ('openFile' | 'openDirectory' | 'multiSelections' | 'createDirectory')[]) {
        button.onclick = (e) => {
            let dialogResult: string[] = dialog.showOpenDialog({ properties: props });
            if (dialogResult != null) {
                txtField.value = dialogResult[0];
            }
        }
    }

    private static addRemoveOnClickHandler(button: HTMLButtonElement, callback: (fmu: Fmu) => void, fmu: Fmu) {
        button.onclick = (e) => {
            callback(fmu);
        }
    }

    private addButtons() {
                let html = `<button type="button" class="btn btn-default btn-sm" id="browse1"><span class="glyphicon glyphicon-file"></span><span class="glyphicon glyphicon-file"></span></button>`
                let element = document.createElement("div")
                element.innerHTML = html;
                let span: HTMLSpanElement = <HTMLSpanElement>this.html.querySelector("#fmuSpanBts")
                span.insertBefore(element.firstChild, span.firstChild)
            }
        
    }