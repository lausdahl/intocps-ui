import {KeyFmuElement} from "./key-fmu-element"
import * as Configs from "../../intocps-configurations/intocps-configurations";

export class FmuKeys {
    private container: HTMLDivElement;
    private multiModelDOM: Configs.MultiModelConfig;
    private fmuKeyElements: KeyFmuElement[] = [];
    private elementContainer: HTMLDivElement;
    private onChangeHandler: (fmu: Configs.Fmu, reloadDom: boolean) => void;
    private onPathChangedHandler: (fmu: Configs.Fmu) => void;
    private onRemoveHandler: (fmu: Configs.Fmu) => void;

    constructor(container: HTMLDivElement) {
        this.container = container;
        this.elementContainer = <HTMLDivElement>this.container.querySelector("#fmu-keys-elements");
    }

    addData(multiModelDOM: Configs.MultiModelConfig) {
        this.multiModelDOM = multiModelDOM;
        multiModelDOM.fmus.forEach((element: Configs.Fmu) => {
            this.addFmu(element);
        });
    }

    setOnChangeHandler(callback: (fmu: Configs.Fmu, reloadDom: boolean) => void) {
        this.onChangeHandler = callback;
    }

    setOnPathChangeHandler(callback: () => void) {
        this.onPathChangedHandler = callback;
    }
    
    setOnRemoveHandler(callback: (fmu: Configs.Fmu) => void){
        this.onRemoveHandler = callback;
    }

    public addFmu(fmu?: Configs.Fmu) {
        let self = this;
        $('<div>').load("multimodel/fmu-keys/key-fmu-element.html", function (event: JQueryEventObject) {
            let html: HTMLDivElement = <HTMLDivElement>(<HTMLDivElement>this).firstChild;
            let newFmu = false;
            if (fmu == null) {
                fmu = new Configs.Fmu("{FMU}", "");
                newFmu = true;
            }
            let element = new KeyFmuElement(html, fmu, self.keyChangeCallback.bind(self), self.onPathChanged.bind(self), self.removeCallback.bind(self), newFmu);
            self.fmuKeyElements.push(element);
            self.elementContainer.appendChild(html);
        });
    }

    private keyChangeCallback(element: KeyFmuElement, text: string): boolean {
        let elementFmu = element.getFmu();
        // Get the elements with the same name. 
        if (this.multiModelDOM.fmus.some(elem => elem.name == text && elem != elementFmu)) {
            return false;
        } else {
            let reloadDom: boolean = false;
            //Check if it is a new fmu
            if (this.multiModelDOM.fmus.indexOf(elementFmu) == -1) {
                reloadDom = true;
                this.multiModelDOM.fmus.push(elementFmu);
            }
            elementFmu.name = text;
            this.onChangeHandler(elementFmu, reloadDom);
            return true;
        }
    }

    private onPathChanged(element: KeyFmuElement, path: string) {
        element.getFmu().path = path;
        // The fmu must exist with a key.
        if (this.multiModelDOM.fmus.indexOf(element.getFmu()) != -1) {
            if (this.onPathChangedHandler != null) {
                this.onPathChangedHandler(element.getFmu());
            }
        }
    }

    private removeCallback(element: KeyFmuElement) {
        // this.multiModelDOM.fmus.splice(this.multiModelDOM.fmus.indexOf(element.getFmu()), 1);
        this.elementContainer.removeChild(element.getHtml());
        this.onRemoveHandler(element.getFmu());
        // this.onChangeHandler(element.getFmu(), false);
    }
}