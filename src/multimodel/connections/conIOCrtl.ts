/// <reference path="../../../node_modules/typescript/lib/lib.es6.d.ts" />
import {Scalar} from "./scalar"
import {Instance} from "./instance";
import {OutputElement} from "./outputElement";
import * as Collections from "typescript-collections";

export class ConIOCrtl {
    html: HTMLDivElement;

    fmusList: HTMLUListElement;
    selectedOutputFmu: OutputElement;
    outputFmus: Array<OutputElement>;

    instancesList: HTMLUListElement;
    outputInstances: Array<Instance>;
    selectedInstance: Instance;

    outputScalarList: HTMLUListElement;
    outputScalars: Array<Scalar>
    selectedScalar: Scalar
    data: Map<string, Map<string, Map<string, string[]>>>
    
    


    constructor(html: HTMLDivElement) {
        this.html = html;
        this.fmusList = <HTMLUListElement>html.querySelector("#connections-fmuinstances-fmus");
        this.instancesList = <HTMLUListElement>html.querySelector("#connections-fmuinstances-fmus");
    }
    
    addFmus(){}
    
    addData(data: Map<string, Map<string, Map<string, string[]>>>) {
        this.data = data;
        let self = this;
        // Setting all FMUs
        let iterator: IterableIterator<string> = data.keys();
        let next: IteratorResult<string>;
        while (!(next = iterator.next()).done) {
            // Load the html
            $('<div>').load("multimodel/connections/output.html", function (event: JQueryEventObject) {
                let outputHtml: HTMLLinkElement = <HTMLLinkElement>(<HTMLDivElement>this).firstChild;
                let outputFmu = new OutputElement(outputHtml, iterator.next().value, self.outputFmuSelected);
                self.outputFmus.push(outputFmu);
                self.fmusList.appendChild(outputFmu.getHtml());
            });
        }
    }
    
    private createOutputElements() : Array<OutputElement> {
        return [];
    }
    
    private outputFmuSelected(output: OutputElement) {

    }

    private addOutputInstance(iterator: IterableIterator<string>) {

    }
    private removeOutputInstance(instanceToRemove: HTMLLinkElement) { }
}