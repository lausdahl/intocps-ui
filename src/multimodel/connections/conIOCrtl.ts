/// <reference path="../../../node_modules/typescript/lib/lib.es6.d.ts" />
import {Scalar} from "./scalar"
import {Instance} from "./instance";
import {Output} from "./output";
import * as Collections from "typescript-collections";

export class ConIOCrtl {
    html: HTMLDivElement;

    outputFmusList: HTMLUListElement;
    selectedOutputFmu: Output;
    outputFmus: Array<Output>;

    outputInstancesList: HTMLUListElement;
    outputInstances: Array<Instance>;
    selectedInstance: Instance;

    outputScalarList: HTMLUListElement;
    outputScalars: Array<Scalar>
    selectedScalar: Scalar
    data: Map<string, Map<string, Map<string, string[]>>>


    constructor(html: HTMLDivElement) {
        this.html = html;
        this.outputFmusList = <HTMLUListElement>html.querySelector("#connections-outputs-fmus");
        this.outputInstancesList = <HTMLUListElement>html.querySelector("#connections-outputs-instances");
        this.outputScalarList = <HTMLUListElement>html.querySelector("#connections-outputs-scalars");
    }

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
                let outputFmu = new Output(outputHtml, iterator.next().value, self.outputFmuSelected);
                self.outputFmus.push(outputFmu);
                self.outputFmusList.appendChild(outputFmu.getHtml());
            });
        }
    }
    private outputFmuSelected(output: Output) {

    }

    private addOutputInstance(iterator: IterableIterator<string>) {

    }
    private removeOutputInstance(instanceToRemove: HTMLLinkElement) { }
}