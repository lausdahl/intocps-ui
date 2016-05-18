import {InstanceElement} from "../connections/instance-element.ts"
import * as Configs from "../../intocps-configurations/intocps-configurations";
import {TextInput, TextInputState} from "./text-input";
export class KeyFmuElement {
    container: HTMLDivElement;
    keyContainer: HTMLDivElement;
    keyElement: TextInput;
    keyChangeCallback: (element: KeyFmuElement, text: string) => boolean;
    fmu: Configs.Fmu;
    pathContainer: HTMLDivElement;
    pathTextField: HTMLInputElement
    dialog: Electron.Dialog;
    platform: string;
    removeCallback: (element: KeyFmuElement) => void;
    constructor(container: HTMLDivElement, fmu: Configs.Fmu, keyChangeCallback: (element: KeyFmuElement, text: string) => boolean, removeCallback: (element: KeyFmuElement) => void, newFmu: boolean) {
        this.container = container;
        this.fmu = fmu;
        this.keyChangeCallback = keyChangeCallback;
        this.removeCallback = removeCallback;
        
        let remote: Electron.Remote = require("electron").remote;
        this.dialog = remote.require("dialog");
        this.platform = remote.getGlobal("intoCpsApp").platform;
        
        this.initializeKey(newFmu);
        this.initializeBrowseComponent(fmu);
        
        
    }
    getFmu() {
        return this.fmu;
    }

    getHtml() {
        return this.container;
    }

    private initializeKey(newFmu: boolean) {
        this.keyContainer = <HTMLDivElement>this.container.querySelector("#multimodel-fmu_keys-key");
        let self = this;
        $(this.keyContainer).load("./multimodel/fmu-keys/text-input.html", function (event: BaseJQueryEventObject) {
            let html: HTMLDivElement = <HTMLDivElement>(<HTMLDivElement>this).firstChild;
            self.keyElement = new TextInput(html, self.fmu.name, self.textChanged.bind(self), newFmu ? TextInputState.EDIT : TextInputState.OK)
        });
    }

    private initializeBrowseComponent(fmu: Configs.Fmu) {
        this.pathContainer = <HTMLDivElement>this.container.querySelector("#multimodel-fmu_keys-path");
        this.pathTextField = <HTMLInputElement>this.pathContainer.querySelector("#fmuPath");
        if (fmu.path != null) {
            this.pathTextField.value = fmu.path;
        }
        this.addBrowseButtons();
        let removeButton = <HTMLButtonElement>this.pathContainer.querySelector("#fmuRemoveBut");
        removeButton.onclick = (e) => {this.removeCallback(this)};
    }

    // Depends on platform
    private addBrowseButtons() {
        let addBrowseClickHandler = (button: HTMLButtonElement, txtField: HTMLInputElement, dialog: Electron.Dialog, props: ('openFile' | 'openDirectory' | 'multiSelections' | 'createDirectory')[]) => {
        button.onclick = (e) => {
            let dialogResult: string[] = dialog.showOpenDialog({ properties: props });
            if (dialogResult != null) {
                txtField.value = dialogResult[0];
            }
        }
    }
        let getButtonFragment = (platform: string, range: Range) => {
            if (platform !== "darwin") {
                let html = `<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-file"></span> File</button><button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-folder-open"></span> Folder </button>`
                let docFragment = range.createContextualFragment(html);
                addBrowseClickHandler(<HTMLButtonElement>docFragment.lastChild, this.pathTextField, this.dialog, ["openDirectory"]);
                addBrowseClickHandler(<HTMLButtonElement>docFragment.firstChild, this.pathTextField, this.dialog, ["openFile"]);
                return docFragment;
            }
            else {
                let html = `<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-file"></span><span class="glyphicon glyphicon-folder-open"></span> File/Folder</button>`
                let docFragment = range.createContextualFragment(html);
                addBrowseClickHandler(<HTMLButtonElement>docFragment.firstChild, this.pathTextField, this.dialog, ["openFile", "openDirectory"])
                return docFragment;
            }
        }

        let span: HTMLSpanElement = <HTMLSpanElement>this.pathContainer.querySelector("#fmuSpanBts");
        let range: Range = document.createRange();
        let buttonFragment = getButtonFragment(this.platform, range);
        span.insertBefore(buttonFragment, span.firstChild);
    }

    private textChanged(text: string) {
        return this.keyChangeCallback(this, text);
    }
}