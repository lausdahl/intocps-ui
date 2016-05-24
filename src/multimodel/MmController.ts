//TODO: DUMMY REFERENCE UNTIL CHART MAKES A TYPESCRIPT DEFINITION FILE!
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />

import * as Main from  "../settings/settings"
import * as IntoCpsApp from  "../IntoCpsApp"
import {IntoCpsAppEvents} from "../IntoCpsAppEvents";
import * as Collections from 'typescript-collections';
import {MultiModelConfig, Serializer} from "../intocps-configurations/intocps-configurations";
import * as Configs from "../intocps-configurations/intocps-configurations";
import {Parameters} from "./parameters/parameters";

import {IProject} from "../proj/IProject";
import {SettingKeys} from "../settings/SettingKeys";
import {ListElement} from "./connections/list-element";
import {IViewController} from "../iViewController";
import {SourceDom} from "../sourceDom";
import {FmuInstancesElement} from "./connections/fmu-instances-element";
import {ConnectionsElement} from "./connections/connections-element";
import {FmuKeys} from "./fmu-keys/fmu-keys";
import Path = require('path');


enum MmContainers {
    Instances = 1 << 0,
    Connections = 1 << 1,
    Parameters = 1 << 2,
    Keys = 1 << 3,
}

export class MmController extends IViewController {
    mm: MultiModelConfig = new MultiModelConfig();
    private multiModelFmusDiv: HTMLDivElement;
    private fmuAddButton: HTMLButtonElement;
    private fmuKeysElement: FmuKeys

    private fmuInstancesDiv: HTMLDivElement;
    private fmuInstancesElement: FmuInstancesElement;

    private connectionsDiv: HTMLDivElement;
    private connectionsElement: ConnectionsElement;

    private parametersDiv: HTMLDivElement;
    private parameters: Parameters;


    constructor(mainViewDiv: HTMLDivElement) {
        super(mainViewDiv);
    }

    initialize(sourceDom: SourceDom) {
        IntoCpsApp.IntoCpsApp.setTopName("Multi-Model");

        this.fmuInstancesDiv = <HTMLDivElement>document.getElementById("multimodel-fmu-instances");
        this.connectionsDiv = <HTMLDivElement>document.getElementById("multimodel-connections");
        this.multiModelFmusDiv = <HTMLDivElement>document.getElementById("multimodel-fmus");
        this.fmuAddButton = <HTMLButtonElement>document.getElementById("multimodel-fmu-add");
        this.parametersDiv = <HTMLDivElement>document.getElementById("parameters-div");
        this.parametersDiv.innerHTML = "";

        var remote = require('remote');
        var Menu = remote.require('menu');
        var ipc = require('electron').ipcRenderer;
        ipc.on(IntoCpsAppEvents.PROJECT_CHANGED, function (event, arg) {
            console.log("project-changed");  // prints "ping"

        });
        this.load(sourceDom.getPath());
    }

    deInitialize() {
        this.mm.save();
        return true;
    }

    private loadComponents(multiModelConfig: MultiModelConfig, containers: MmContainers) {
        if (containers & MmContainers.Keys) {
            $(this.multiModelFmusDiv).load("multimodel/fmu-keys/fmu-keys.html", (event: JQueryEventObject) => {
                this.fmuKeysElement = new FmuKeys(<HTMLDivElement>this.multiModelFmusDiv.firstChild);
                this.fmuKeysElement.addData(this.mm);
                this.fmuKeysElement.setOnChangeHandler(this.onKeyChange.bind(this));
                this.fmuKeysElement.setOnPathChangeHandler(this.onPathChange.bind(this));
                this.fmuKeysElement.setOnRemoveHandler(this.onFmuRemove.bind(this));
                this.fmuAddButton.onclick = () => this.fmuKeysElement.addFmu();
            });
        }

        if (containers & MmContainers.Instances) {
            $(this.fmuInstancesDiv).load("multimodel/connections/fmu-instances-element.html", (event: JQueryEventObject) => {
                this.fmuInstancesElement = new FmuInstancesElement(this.fmuInstancesDiv);
                this.fmuInstancesElement.setOnChangeHandler(this.onInstancesChanged.bind(this));
                this.fmuInstancesElement.addData(this.mm);
            });
        }
        if (containers & MmContainers.Connections) {
            $(this.connectionsDiv).load("multimodel/connections/connections.html", (event: JQueryEventObject) => {
                this.connectionsElement = new ConnectionsElement(this.connectionsDiv);
                this.connectionsElement.addData(this.mm);
            });
        }

        if (containers & MmContainers.Parameters) {
            let loadedCallback = (parameters: Parameters) => {
                this.parametersDiv.appendChild(parameters.getContainer());
            }

            this.parameters = new Parameters(loadedCallback.bind(this), this.mm);
        }


    }

    public load(path: string) {


        //this.coeConfig = new CoeConfig();
        //this.coeConfig.load(path, activeProject.getRootFilePath());
        //this.coeConfig.loadFromMultiModel(path,IntoCpsApp.IntoCpsApp.getInstance().getActiveProject().getFmusPath());
        //until bind is implemented we do this manual sync

        MultiModelConfig.parse(path, IntoCpsApp.IntoCpsApp.getInstance().getActiveProject().getFmusPath()).then(mm => {
            this.mm = mm;
            this.loadComponents(this.mm, MmContainers.Keys | MmContainers.Instances | MmContainers.Connections | MmContainers.Parameters);
        }).catch(e => console.error(e));
    }

    private getConnectionInstance(id: string): string {//"{x2}.tank.valvecontrol"
        var dotIndex = id.indexOf('.');
        var secondDotIndex = id.substring(dotIndex + 1).indexOf('.');
        return id.substring(0, secondDotIndex + dotIndex + 1);
    }

    private getDefinedInstances(connections: Map<String, Collections.LinkedList<String>>) {
        let _this = this;
        var instances: string[] = [];

        connections.forEach((value: Collections.LinkedList<String>, index: String, map: Map<String, Collections.LinkedList<String>>) => {

            instances.push(_this.getConnectionInstance(index + ""));

            value.forEach((s: String) => { instances.push(_this.getConnectionInstance(s + "")); });


        });
        return Array.from(new Set(instances));

    }

    private extractOuputsAndInputs(fmus: any, instances: string[]) {
        fmus.forEach((value: any, index: any, map: any) => {

            var p = Path.normalize(IntoCpsApp.IntoCpsApp.getInstance().getActiveProject().getFmusPath() + "/" + value.path);

            let fmuInstances: string[] = instances.filter((value: string) => {
                return value.indexOf(index + "") == 0;
            });

            this.readModelDescriptionFromFmuAsync(fmuInstances, p);
        });
    }


    private readModelDescriptionFromFmuAsync(instances: string[], path: string) {
        let _this = this;
        //        https://stuk.github.io/jszip/documentation/howto/read_zip.html
        var JSZip = require("jszip");
        var fs = require("fs");

        console.info(path);
        // read a zip file
        fs.readFile(path, function (err: any, data: any) {
            if (err) throw err;
            var zip = new JSZip();

            zip.loadAsync(data).then(function (k: any) {
                let md = zip.file("modelDescription.xml").async("string")
                    .then(function (content: string) {
                        // use content
                        // console.info(content);

                        var oParser = new DOMParser();
                        var oDOM = oParser.parseFromString(content, "text/xml");
                        var iterator = document.evaluate('//ScalarVariable[@causality="output"]/@name', oDOM, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

                        var thisNode = iterator.iterateNext();

                        var outputs: any[] = [];

                        while (thisNode) {

                            instances.forEach((value: string) => {
                                let id = value + "." + thisNode.textContent
                                console.info(" ScalarVariable output: " + id);
                                outputs.push(id);
                            });

                            thisNode = iterator.iterateNext();
                        }



                        var iterator = document.evaluate('//ScalarVariable[@causality="input"]/@name', oDOM, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

                        var thisNode = iterator.iterateNext();

                        while (thisNode) {
                            instances.forEach((value: string) => {
                                let id = value + "." + thisNode.textContent
                                console.info(" ScalarVariable input: " + id);
                            });
                            thisNode = iterator.iterateNext();
                        }
                    });
            });
        });
    }

    private onPathChange(fmu: Configs.Fmu) {
        this.onKeyChange(fmu, true);
    }
    private cleanAndReload(containers: number){
        this.clearContainers(containers);
        this.loadComponents(this.mm, containers);
    }
    private onKeyChange(fmu: Configs.Fmu, reloadDom: boolean) {
        let cleanAndReload = () => {
            let containers = MmContainers.Instances | MmContainers.Connections | MmContainers.Parameters;
            this.clearContainers(containers);
            this.loadComponents(this.mm, containers);
        }
        // Refresh FMU Instances, Connections, and parameters
        let promise: Promise<void> = null;
        if (reloadDom) {
            //FIXME fmu.reset();
            fmu.populate().then(() => { cleanAndReload(); })
        } else {
            cleanAndReload();
        }
    }
    
    private onFmuRemove(fmu: Configs.Fmu){
        // Remove the FMU
        this.mm.removeFmu(fmu);
        // Reload the UI
        let containers = MmContainers.Instances | MmContainers.Connections | MmContainers.Parameters;
        this.cleanAndReload(containers);
        
    }

    private onInstancesChanged() {
        // Refresh Connections and parameters
        let containers = MmContainers.Connections | MmContainers.Parameters;
        this.clearContainers(containers);
        this.loadComponents(this.mm, containers);
    }

    //Clear the list containers
    private clearContainers(containers: MmContainers) {
        let clearContainer = (container: HTMLDivElement, object: Object) => {
            while (container.hasChildNodes()) {
                container.removeChild(container.lastChild);
            }
            object = null;
        }

        if (containers & MmContainers.Instances) {
            clearContainer(this.fmuInstancesDiv, this.fmuInstancesElement);
        }
        if (containers & MmContainers.Connections) {
            clearContainer(this.connectionsDiv, this.connectionsElement);
        }
        if (containers & MmContainers.Parameters) {
            clearContainer(this.parametersDiv, this.parameters);
        }

        if (containers & MmContainers.Keys) {
            clearContainer(this.multiModelFmusDiv, this.fmuKeysElement);
        }
    }


    private extractConnections(connections: Map<String, Collections.LinkedList<String>>): any {
        var cons: any = new Object();

        connections.forEach((value: Collections.LinkedList<String>, index: String, map: Map<String, Collections.LinkedList<String>>) => {

            var inputs: string[] = [];

            value.forEach((s: String) => { inputs.push(s + ""); });

            cons[index + ""] = inputs;

        });
        return cons;
    }
}
