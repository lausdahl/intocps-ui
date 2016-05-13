/// <reference path="../../../node_modules/typescript/lib/lib.es6.d.ts" />
import {Scalar} from "./scalar"
import {OutputElement} from "./outputElement";
import * as Collections from "typescript-collections";
import {Fmu, Instance} from "../../coe/fmi";
import {FmuElement} from "./fmu-element";
import {InstanceElement} from "./instance-element";

export class MultiModelDOM {
    //path to the source from which this DOM is generated
    sourcePath: string;
    fmus: Fmu[] = [];
    fmuInstances: Instance[] = [];
}

export class FmuInstancesElement {
    html: HTMLDivElement;

    fmuList: HTMLUListElement;
    selectedFmuElement: FmuElement;
    fmuElements: Array<FmuElement> = [];

    instanceList: HTMLUListElement;
    instanceElements: Array<InstanceElement> = [];

    multiModelDOM: MultiModelDOM;

    addInstancesButton: HTMLButtonElement;

    constructor(html: HTMLDivElement) {
        this.html = html;
        this.fmuList = <HTMLUListElement>html.querySelector("#connections-fmuinstances-fmus");
        this.instanceList = <HTMLUListElement>html.querySelector("#connections-fmuinstances-instances");
        this.addInstancesButton = <HTMLButtonElement>this.html.querySelector("#fmu-instances-add-but"); 
        this.addInstancesButton.onclick = this.addNewInstanceHandler.bind(this);
        let dummyDom = new MultiModelDOM();
        let fmu1 = new Fmu("abe", "abe");
        let fmu2 = new Fmu("abe2", "abe2");
        dummyDom.fmus.push(fmu1, fmu2);
        let instance: Instance = new Instance();
        instance.name = "tiger";
        instance.fmu = fmu1;
        let instance2: Instance = new Instance();
        instance2.name = "tiger2";
        instance2.fmu = fmu1;
        let instance3: Instance = new Instance();
        instance3.name = "elephant";
        instance3.fmu = fmu2;
        dummyDom.fmuInstances.push(instance, instance2, instance3);
        this.addData(dummyDom);

    }
    addData(multiModelDOM: MultiModelDOM) {
        this.multiModelDOM = multiModelDOM;
        this.addFmus(this.multiModelDOM.fmus);
    }

    private addFmus(fmus: Fmu[]) {
        let self = this;
        fmus.forEach((fmu: Fmu) => {
            $('<div>').load("multimodel/connections/fmu-element.html", function (event: JQueryEventObject) {
                let html: HTMLLinkElement = <HTMLLinkElement>(<HTMLDivElement>this).firstChild;
                let element: FmuElement = new FmuElement(html, fmu, self.fmuSelectionChanged.bind(self));
                self.fmuElements.push(element);
                self.fmuList.appendChild(element.getHtml());
            });
        });
    }

    private fmuSelectionChanged(fmuElement: FmuElement) {
        if(this.addInstancesButton.classList.contains("hidden")) {this.addInstancesButton.classList.remove("hidden");}
        this.fmuElements.forEach((fmuElementPar: FmuElement) => {
            if (fmuElementPar !== fmuElement)
                fmuElementPar.deselect();
        });


        //Remove all the existing instances
        while (this.instanceList.firstChild) {
            this.instanceList.removeChild(this.instanceList.firstChild);
        }
        this.instanceElements = [];


        //Add the new instances based on the FMU
        let instances: Instance[] = this.multiModelDOM.fmuInstances.filter((instance: Instance) => {
            return instance.fmu === fmuElement.getFmu();
        });

        this.addInstances(instances);
        this.selectedFmuElement = fmuElement;
    }

    private addInstances(instances: Instance[]) {
        let self = this;
        instances.forEach((instance: Instance) => {
            $('<div>').load("multimodel/connections/instance-element.html", function (event: JQueryEventObject) {
                let html: HTMLDivElement = <HTMLDivElement>(<HTMLDivElement>this).firstChild;
                let element: InstanceElement = new InstanceElement(html, instance, self.removeInstance.bind(self), self.addInstanceHandler.bind(self));
                self.instanceElements.push(element);
                self.instanceList.appendChild(element.getHtml());
            });
        });
    }

    private addNewInstanceHandler(){
        let self = this;
        $('<div>').load("multimodel/connections/instance-element.html", function (event: JQueryEventObject) {
                let html: HTMLDivElement = <HTMLDivElement>(<HTMLDivElement>this).firstChild;
                let instance = new Instance();
                instance.fmu = self.selectedFmuElement.getFmu();
                let element: InstanceElement = new InstanceElement(html, instance, self.removeInstance.bind(self), self.addInstanceHandler.bind(self), true);
                self.instanceList.appendChild(element.getHtml());
            });
    }
    // If an instance already exists with the same name then return false
    // otherwise add the element to instanceElements and the DOM
    private addInstanceHandler(instanceElement: InstanceElement) {
        let exists: number = this.instanceElements.findIndex((val: InstanceElement) => {
            return val.getInstance().name == instanceElement.getInstance().name; 
        });
        if (exists > -1) {
            if(this.instanceElements[exists] == instanceElement){
                return true;
            }
            else{
                return false;
            }
        }
        else {
            this.multiModelDOM.fmuInstances.push(instanceElement.getInstance());
            this.instanceElements.push(instanceElement);
            return true;
        }
    }

    private removeInstance(instanceElement: InstanceElement) {
        // Remove instance from DOM
        let index = this.multiModelDOM.fmuInstances.findIndex((val: Instance) => {return val === instanceElement.getInstance()});
        if(index > -1){
            this.multiModelDOM.fmuInstances.splice(index, 1);
        }
        
        // Remove instance from HTML
        this.instanceList.removeChild(instanceElement.getHtml());
        this.instanceElements.splice(this.instanceElements.findIndex((val: InstanceElement) =>{return val === instanceElement}),1);
    }
}