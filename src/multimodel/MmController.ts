//TODO: DUMMY REFERENCE UNTIL CHART MAKES A TYPESCRIPT DEFINITION FILE!
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />

import * as Main from  "../settings/settings"
import * as IntoCpsApp from  "../IntoCpsApp"
import {IntoCpsAppEvents} from "../IntoCpsAppEvents";
import {Fmu} from "./fmu"
import * as Collections from 'typescript-collections';
import {MultiModelConfig, Serializer} from "../intocps-configurations/intocps-configurations";

import {IProject} from "../proj/IProject";
import {SettingKeys} from "../settings/SettingKeys";
import {Input} from "./connections/input";
import {OutputElement} from "./connections/outputElement";
import {IViewController} from "../iViewController";
import {SourceDom} from "../sourceDom";
import {FmuInstancesElement} from "./connections/fmu-instances-element";
import Path = require('path');


export class MmController extends IViewController {
    mm: MultiModelConfig = new MultiModelConfig();

    private fmuCounter: number = 0;
    private fmusDiv: HTMLDivElement;
    private fmus: Fmu[] = [];

    private outputList: HTMLUListElement;
    private outputs: OutputElement[] = [];
    private inputList: HTMLUListElement;
    private inputs: Input[] = [];
    private allInputs: any = [];
    private allOutputs: any = [];
    private connections: any = [];
    private selectedOutput: OutputElement;

    private parametersDiv: HTMLDivElement;

    private fmuInstancesDiv: HTMLDivElement;
    private fmuInstancesElement: FmuInstancesElement;

    constructor(mainViewDiv: HTMLDivElement) {
        super(mainViewDiv);
    }

    initialize(sourceDom: SourceDom) {
        IntoCpsApp.IntoCpsApp.setTopName("Multi-Model");

        this.fmusDiv = <HTMLDivElement>document.getElementById("fmusDiv");
        this.parametersDiv = <HTMLDivElement>document.getElementById("parametersDiv");
        this.outputList = <HTMLUListElement>document.getElementById("connections-outputs");
        this.inputList = <HTMLUListElement>document.getElementById("connections-inputs");
        this.fmuInstancesDiv = <HTMLDivElement>document.getElementById("multimodel-fmu-instances");
        $(this.fmuInstancesDiv).load("multimodel/connections/fmu-instances.html", (event: JQueryEventObject) => {
            this.fmuInstancesElement = new FmuInstancesElement(this.fmuInstancesDiv);
        });

        this.parametersDiv.innerHTML = "";

        var remote = require('remote');
        var Menu = remote.require('menu');
        var ipc = require('electron').ipcRenderer;
        ipc.on(IntoCpsAppEvents.PROJECT_CHANGED, function (event, arg) {
            console.log("project-changed");  // prints "ping"

        });

        this.allInputs = [];
        this.allOutputs = [];
        this.connections = [];

        this.load(sourceDom.getPath());
    }

    public load(path: string) {
        this.fmus.forEach((value: Fmu, index: number, array: Fmu[]) => {
            this.removeFmu(value);
        });


        //this.coeConfig = new CoeConfig();
        //this.coeConfig.load(path, activeProject.getRootFilePath());
        //this.coeConfig.loadFromMultiModel(path,IntoCpsApp.IntoCpsApp.getInstance().getActiveProject().getFmusPath());
        //until bind is implemented we do this manual sync

        MultiModelConfig.parse(path, IntoCpsApp.IntoCpsApp.getInstance().getActiveProject().getFmusPath()).then(mm => {
            this.mm = mm;

            mm.fmus.forEach(fmu => {
                this.addFmu(fmu.name, fmu.path);
            });

        }).catch(e => console.error(e));


        /* this.coeConfig.fmus.forEach((value, index, map) => {
             path = value.description.length == 0 ? value.path : value.description;
             this.addFmu(index + "", path);
         });
 */

        //  this.connections = this.extractConnections(this.coeConfig.connections);
        // this.extractOuputsAndInputs(this.mm.fmus, this.getDefinedInstances(this.mm.connections));

        this.mm.fmuInstances.forEach((instance) => {
            instance.initialValues.forEach((value, sv) => {
                this.parametersDiv.innerHTML += Serializer.getIdSv(instance, sv) + " = " + value + "<br/>";
            });

        });

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
                                _this.allOutputs.push(id);
                                outputs.push(id);
                            });

                            thisNode = iterator.iterateNext();
                        }

                        _this.setOutputs(outputs);


                        var iterator = document.evaluate('//ScalarVariable[@causality="input"]/@name', oDOM, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

                        var thisNode = iterator.iterateNext();

                        while (thisNode) {

                            instances.forEach((value: string) => {

                                let id = value + "." + thisNode.textContent
                                console.info(" ScalarVariable input: " + id);
                                _this.allInputs.push(id);

                            });


                            thisNode = iterator.iterateNext();
                        }


                    });
            });
        });
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


    removeFmu(fmu: Fmu) {
        if (this.fmusDiv.contains(fmu.getHtml()))
            this.fmusDiv.removeChild(fmu.getHtml());
        this.fmus.splice(this.fmus.indexOf(fmu), 1);
    };

    addFmu(fmuName: string, path: string) {
        // https://forum.jquery.com/topic/load-but-append-data-instead-of-replace
        let self = this;
        $('<div>').load("multimodel/fmu.html", function (event: JQueryEventObject) {
            let fmuHtml: HTMLElement = <HTMLElement>(<HTMLDivElement>this).firstChild;
            let name = fmuName == null ? "{FMU" + self.fmuCounter + "}" : fmuName;
            let newFmu: Fmu = new Fmu(fmuHtml, self.removeFmu.bind(self), name, path);
            self.fmus.push(newFmu);
            self.fmusDiv.appendChild(fmuHtml);
            self.fmuCounter++;
        });
    }


    private setConnectionsExample() {
        this.setConnections({ "output1": ["input1", "input2"], "output2": ["input3"] }, ["output1", "output2", "output3"], ["input1", "input2", "input3"]);
    }

    setConnections(connections: any, allOutputs: Array<string>, allInputs: Array<string>) {

        //Add all outputs to the list
        this.connections = connections;
        this.allOutputs = allOutputs;
        this.allInputs = allInputs;
        this.setOutputs(allOutputs);
    }

    //Add all the outputs to the output list
    private setOutputs(allOutputs: any) {
        let mthis = this;
        allOutputs.forEach((element: any) => {
            $('<div>').load("multimodel/connections/output.html", function (event: BaseJQueryEventObject) {
                let html: HTMLLinkElement = <HTMLLinkElement>(<HTMLDivElement>this).firstChild;
                mthis.outputList.appendChild(html);
                let output: OutputElement = new OutputElement(html, element, mthis.outputSelected.bind(mthis));
                mthis.outputs.push(output);
            });
        });
    }

    //Based on a given output populate the input list.
    //If the given output also exists in connections, mark checked as true.
    private setInputs(output: string) {
        let mthis = this;
        this.allInputs.forEach((inputName: string) => {
            $('<div>').load("multimodel/connections/input.html", function (event: BaseJQueryEventObject) {
                let html: HTMLLinkElement = <HTMLLinkElement>(<HTMLDivElement>this).firstChild;
                mthis.inputList.appendChild(html);

                var checked: boolean = false;
                if (output in mthis.connections && (<Array<String>>mthis.connections[output]).indexOf(inputName) > -1) {
                    checked = true;
                }
                let input: Input = new Input(html, inputName, checked, mthis.inputChanged.bind(mthis));
                mthis.inputs.push(input);
            });
        });
    }

    private inputChanged(input: Input) {
        if (!(this.selectedOutput.getName() in this.connections)) {
            this.connections[this.selectedOutput.getName()] = [];
        }
        let outputConnections: Array<string> = <Array<string>>this.connections[this.selectedOutput.getName()];
        if (input.getChecked()) {
            outputConnections.push(input.getName());
        }
        else {
            outputConnections.splice(outputConnections.indexOf(input.getName()), 1);
            if (outputConnections.length === 0) {
                delete this.connections[this.selectedOutput.getName()];
            }
        }
    }

    private outputSelected(output: OutputElement) {
        this.outputs.filter((obj: OutputElement) => { return obj !== output }).forEach((obj: OutputElement) => { obj.deselect() });
        while (this.inputList.hasChildNodes()) {
            this.inputList.removeChild(this.inputList.firstChild);
        }
        this.setInputs(output.getName());
        this.selectedOutput = output;
    }
}
