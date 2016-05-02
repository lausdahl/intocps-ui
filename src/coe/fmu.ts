///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
export class Fmu {
    fmuName: HTMLLabelElement;
    html: HTMLElement;
    pathTextField: HTMLInputElement
    dialog: Electron.Dialog;
    platform: string;
    constructor(html: HTMLElement, removeCallBack: (fmu: Fmu) => void, fmuName?: string, path?: string) {
        let remote: Electron.Remote = require("electron").remote;
        this.dialog = remote.require("dialog");
        this.platform = remote.getGlobal("intoCpsApp").platform;
        this.html = html;

        this.pathTextField = <HTMLInputElement>this.html.querySelector("#fmuPath");
        if (path != null) {
            this.pathTextField.value = path;
        }

        this.fmuName = <HTMLLabelElement>this.html.querySelector("#fmuName");
        if (fmuName != null) {
            this.fmuName.innerText = fmuName;
        }
        this.addBrowseButtons();
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

    private addBrowseButtons() {
        let getButtonFragment = (platform: string, range: Range) => {
            if (platform !== "darwin") {
                let html = `<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-file"></span> File</button><button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-folder-open"></span> Folder </button>`
                let docFragment = range.createContextualFragment(html);
                Fmu.addBrowseOnClickHandler(<HTMLButtonElement>docFragment.lastChild, this.pathTextField, this.dialog, ["openDirectory"]);
                Fmu.addBrowseOnClickHandler(<HTMLButtonElement>docFragment.firstChild, this.pathTextField, this.dialog, ["openFile"]);
                return docFragment;
            }
            else {
                let html = `<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-file"></span><span class="glyphicon glyphicon-folder-open"></span> File/Folder</button>`
                let docFragment = range.createContextualFragment(html);
                Fmu.addBrowseOnClickHandler(<HTMLButtonElement>docFragment.firstChild, this.pathTextField, this.dialog, ["openFile", "openDirectory"])
                return docFragment;
            }
        }

        let span: HTMLSpanElement = <HTMLSpanElement>this.html.querySelector("#fmuSpanBts");
        let range: Range = document.createRange();
        let buttonFragment = getButtonFragment(this.platform, range);
        span.insertBefore(buttonFragment, span.firstChild);
    }

}