import {KeyFmuElement} from "./key-fmu-element"
import * as Configs from "../../intocps-configurations/intocps-configurations";

export class FmuKeys {
    container: HTMLDivElement;
    multiModelDOM: Configs.MultiModelConfig;
    fmuKeyElements: KeyFmuElement[] = [];

    constructor(container: HTMLDivElement) {
        this.container = container;
    }

    addData(multiModelDOM: Configs.MultiModelConfig) {
        this.multiModelDOM = multiModelDOM;
        multiModelDOM.fmus.forEach((element: Configs.Fmu) => {
            this.addFmu(element);
        });
    }

    private addFmu(fmu: Configs.Fmu) {
        let self = this;
        $('<div>').load("multimodel/fmu-keys/key-fmu-element.html", function (event: JQueryEventObject) {
            let html: HTMLDivElement = <HTMLDivElement>(<HTMLDivElement>this).firstChild;
            let newFmu = false;
            if(fmu == null)
            {
                fmu = new Configs.Fmu("{FMU}", "");
                newFmu = true;
            }
            let element = new KeyFmuElement(html, fmu, self.removeCallback.bind(self), self.keyChangeCallback.bind(self), newFmu);
            self.fmuKeyElements.push(element);
            self.container.appendChild(html);
        });
    }
    
    private keyChangeCallback(element: KeyFmuElement, text: string) : boolean{
        element.getFmu().name = text;
        return true;
    }
    
    private removeCallback(element: KeyFmuElement){
        return true;
    }
}