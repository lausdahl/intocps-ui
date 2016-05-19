import {KeyFmuElement} from "./key-fmu-element"
import * as Configs from "../../intocps-configurations/intocps-configurations";

export class FmuKeys {
    container: HTMLDivElement;
    multiModelDOM: Configs.MultiModelConfig;
    fmuKeyElements: KeyFmuElement[] = [];
    elementContainer: HTMLDivElement;

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

    public addFmu(fmu?: Configs.Fmu) {
        let self = this;
        $('<div>').load("multimodel/fmu-keys/key-fmu-element.html", function (event: JQueryEventObject) {
            let html: HTMLDivElement = <HTMLDivElement>(<HTMLDivElement>this).firstChild;
            let newFmu = false;
            if (fmu == null) {
                fmu = new Configs.Fmu("{FMU}", "");
                newFmu = true;
            }
            let element = new KeyFmuElement(html, fmu, self.keyChangeCallback.bind(self), self.removeCallback.bind(self), newFmu);
            self.fmuKeyElements.push(element);
            self.elementContainer.appendChild(html);
        });
    }

    private keyChangeCallback(element: KeyFmuElement, text: string): boolean {
        let elementFmu = element.getFmu();
        // Get the elements with the same name. 
        if (this.multiModelDOM.fmus.some(elem => elem.name == text && elem != elementFmu)) {
            return false;
        }else{
            //Check if it is a new fmu
            if(this.multiModelDOM.fmus.indexOf(elementFmu) == -1)
            {
                this.multiModelDOM.fmus.push(elementFmu);
            }
            elementFmu.name = text;
            return true;
        }
    }

    private removeCallback(element: KeyFmuElement) {
        this.multiModelDOM.fmus.splice(this.multiModelDOM.fmus.indexOf(element.getFmu()), 1);
        this.elementContainer.removeChild(element.getHtml());
    }
}