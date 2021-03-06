/// <reference path="../../../node_modules/typescript/lib/lib.es6.d.ts" />
import {Scalar} from "./scalar"
import {OutputElement} from "./outputElement";
import * as Collections from "typescript-collections";
import {FmuElement} from "./fmu-element";
import {InstanceElement} from "./instance-element";
import * as Configs from "../../intocps-configurations/intocps-configurations";


export class FmuInstancesElement {
    html: HTMLDivElement;

    fmuList: HTMLUListElement;
    selectedFmuElement: FmuElement;
    fmuElements: Array<FmuElement> = [];

    instanceList: HTMLUListElement;
    instanceElements: Array<InstanceElement> = [];

    multiModelDOM: Configs.MultiModelConfig;

    addInstancesButton: HTMLButtonElement;

    constructor(html: HTMLDivElement) {
        this.html = html;
        this.fmuList = <HTMLUListElement>html.querySelector("#connections-fmuinstances-fmus");
        this.instanceList = <HTMLUListElement>html.querySelector("#connections-fmuinstances-instances");
        this.addInstancesButton = <HTMLButtonElement>this.html.querySelector("#fmu-instances-add-but"); 
        this.addInstancesButton.onclick = this.addNewInstanceHandler.bind(this);
        let dummyDom = new Configs.MultiModelConfig();
        let fmu1 = new Configs.Fmu("abe", "abe");
        let fmu2 = new Configs.Fmu("abe2", "abe2");
        dummyDom.fmus.push(fmu1, fmu2);
        let instance: Configs.Instance = new Configs.Instance(fmu1, "tiger");
        let instance2: Configs.Instance = new Configs.Instance(fmu1, "tiger2");
        let instance3: Configs.Instance = new Configs.Instance(fmu2,"elephant");
        dummyDom.fmuInstances.push(instance, instance2, instance3);
        this.addData(dummyDom);

    }
    addData(multiModelDOM: Configs.MultiModelConfig) {
        this.multiModelDOM = multiModelDOM;
        this.addFmus(this.multiModelDOM.fmus);
    }

    private addFmus(fmus: Configs.Fmu[]) {
        let self = this;
        fmus.forEach((fmu: Configs.Fmu) => {
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
        let instances: Configs.Instance[] = this.multiModelDOM.fmuInstances.filter((instance: Configs.Instance) => {
            return instance.fmu === fmuElement.getFmu();
        });

        this.addInstances(instances);
        this.selectedFmuElement = fmuElement;
    }

    private addInstances(instances: Configs.Instance[]) {
        let self = this;
        instances.forEach((instance: Configs.Instance) => {
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
                let instance = new Configs.Instance(self.selectedFmuElement.getFmu(),"FMU Instance");
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
        let index = this.multiModelDOM.fmuInstances.findIndex((val: Configs.Instance) => {return val === instanceElement.getInstance()});
        if(index > -1){
            this.multiModelDOM.fmuInstances.splice(index, 1);
        }
        
        // Remove instance from HTML
        this.instanceList.removeChild(instanceElement.getHtml());
        this.instanceElements.splice(this.instanceElements.findIndex((val: InstanceElement) =>{return val === instanceElement}),1);
    }
}