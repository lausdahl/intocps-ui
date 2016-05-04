//TODO: DUMMY REFERENCE UNTIL CHART MAKES A TYPESCRIPT DEFINITION FILE!
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />

import * as Main from  "../settings/Settings"
import * as IntoCpsApp from  "../IntoCpsApp"
import {IntoCpsAppEvents} from "../IntoCpsAppEvents";
import {Fmu} from "../coe/fmu"
import * as Collections from 'typescript-collections';
import {CoeConfig} from '../coe/CoeConfig'

import {IProject} from "../proj/IProject";
import {SettingKeys} from "../settings/SettingKeys";
import {Input} from "../coe/input";
import {Output} from "../coe/output";
import Path = require('path');


export class MmController {


    coeConfig: CoeConfig = new CoeConfig();

    private fmuCounter: number = 0;
    private fmusDiv: HTMLDivElement;
    private fmus: Fmu[] = [];

    private outputList: HTMLUListElement;
    private outputs: Output[] = [];
    private inputList: HTMLUListElement;
    private inputs: Input[] = [];
    private allInputs: any = [];
    private allOutputs: any = [];
    private connections: any = [];
    private selectedOutput: Output;

private parametersDiv: HTMLDivElement;

    initialize() {
      
        this.fmusDiv = <HTMLDivElement>document.getElementById("fmusDiv");
         this.parametersDiv = <HTMLDivElement>document.getElementById("parametersDiv");
        this.outputList = <HTMLUListElement>document.getElementById("connections-outputs");
        this.inputList = <HTMLUListElement>document.getElementById("connections-inputs");

this.parametersDiv.innerHTML="";

        var remote = require('remote');
        var Menu = remote.require('menu');
        var ipc = require('electron').ipcRenderer;
        ipc.on(IntoCpsAppEvents.PROJECT_CHANGED, function (event, arg) {
            console.log("project-changed");  // prints "ping"

        });

        this.allInputs = [];
        this.allOutputs = [];
        this.connections = [];
    }

    public load(path: string) {

        this.initialize();

        this.fmus.forEach((value: Fmu, index: number, array: Fmu[]) => {
            this.removeFmu(value);
        });

        this.coeConfig = new CoeConfig();
        //this.coeConfig.load(path, activeProject.getRootFilePath());
        this.coeConfig.loadFromMultiModel(path);
        //until bind is implemented we do this manual sync

        this.coeConfig.fmus.forEach((value, index, map) => {
            this.addFmu(index + "", value.path);
        });

        this.connections = this.extractConnections(this.coeConfig.connections);
        this.extractOuputsAndInputs(this.coeConfig.fmus, this.getDefinedInstances(this.coeConfig.connections));

this.coeConfig.parameters.forEach((value:any,index:String)=>{
    this.parametersDiv.innerHTML+=""+index+" = "+value+"<br/>";
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
        fmus.forEach((value:any, index:any, map:any) => {

            let SESSION_PREFIX = "session:/";
            var p = value.path;
            if (p.indexOf(SESSION_PREFIX) == 0) {
                //session:/
                let remote = require("remote");
                let app: IntoCpsApp.IntoCpsApp = remote.getGlobal("intoCpsApp");
                p = Path.normalize(app.getActiveProject().getFmusPath() + "/" + p.substring(SESSION_PREFIX.length));
            }

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

        // read a zip file
        fs.readFile(path, function (err:any, data:any) {
            if (err) throw err;
            var zip = new JSZip();

            zip.loadAsync(data).then(function (k:any) {
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
        $('<div>').load("coe/fmu.html", function (event: JQueryEventObject) {
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
            $('<div>').load("coe/output.html", function (event: BaseJQueryEventObject) {
                let html: HTMLLinkElement = <HTMLLinkElement>(<HTMLDivElement>this).firstChild;
                mthis.outputList.appendChild(html);
                let output: Output = new Output(html, element, mthis.outputSelected.bind(mthis));
                mthis.outputs.push(output);
            });
        });
    }

    //Based on a given output populate the input list.
    //If the given output also exists in connections, mark checked as true.
    private setInputs(output: string) {
        let mthis = this;
        this.allInputs.forEach((inputName: string) => {
            $('<div>').load("coe/input.html", function (event: BaseJQueryEventObject) {
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

    private outputSelected(output: Output) {
        this.outputs.filter((obj: Output) => { return obj !== output }).forEach((obj: Output) => { obj.deselect() });
        while (this.inputList.hasChildNodes()) {
            this.inputList.removeChild(this.inputList.firstChild);
        }
        this.setInputs(output.getName());
        this.selectedOutput = output;
    }
}