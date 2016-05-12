///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />

import fs = require('fs');

// Holds information about a .fmu container
export class Fmu {
    name: string;
    path: string;
    platforms: Platfomrs[];
    scalarVariables: ScalarVariable[] = [];

    constructor(name: string, path: string) {
        this.name = name;
        this.path = path;
    }

    /*   toJSON(): string {
           var tmp: any = {};
           tmp[this.name] = this.path;
           return JSON.stringify(tmp);
       }*/

    public populate(): Promise<void> {
        let self = this;
        let checkFileExists = new Promise<Buffer>(function (resolve, reject) {
            try {
                if (fs.accessSync(self.path, fs.R_OK)) {
                    reject();
                }
                resolve();
            } catch (e) {
                reject(e);
            }
        });

        //wrap readFile in a promise
        let fileReadPromise = new Promise<Buffer>(function (resolve, reject) {
            fs.readFile(self.path, function (err, data) {
                if (err !== null) {
                    return reject(err);
                }
                resolve(data);
            });
        });

        return checkFileExists.then(() => {
            var JSZip = require("jszip");
            var zip = new JSZip();
            // read a zip file
            return fileReadPromise.then(data => {
                return zip.loadAsync(data);
            }).then(function (k: any) {
                return zip.file("modelDescription.xml").async("string")
            }).then(function (content: string) {
                self.populateFromModelDescription(content);
            });;
        });
    }

    private populateFromModelDescription(content: string) {
        var oParser = new DOMParser();
        var oDOM = oParser.parseFromString(content, "text/xml");

        //output
        var iterator = document.evaluate('//ScalarVariable[@causality="output"]/@name', oDOM, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

        var thisNode = iterator.iterateNext();

        while (thisNode) {
            this.scalarVariables.push({ name: thisNode.textContent, type: ScalarVariableType.Real, causality: CausalityType.Output });
            thisNode = iterator.iterateNext();
        }

        //input
        var iterator = document.evaluate('//ScalarVariable[@causality="input"]/@name', oDOM, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

        var thisNode = iterator.iterateNext();

        while (thisNode) {
            this.scalarVariables.push({ name: thisNode.textContent, type: ScalarVariableType.Real, causality: CausalityType.Input });
            thisNode = iterator.iterateNext();
        }

        //parameter
         iterator = document.evaluate('//ScalarVariable[@causality="parameter"]/@name', oDOM, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

        var thisNode = iterator.iterateNext();

        while (thisNode) {
            this.scalarVariables.push({ name: thisNode.textContent, type: ScalarVariableType.Real, causality: CausalityType.Parameter });
            thisNode = iterator.iterateNext();
        }
          //calculated parameter
         iterator = document.evaluate('//ScalarVariable[@causality="calculatedParameter"]/@name', oDOM, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

        var thisNode = iterator.iterateNext();

        while (thisNode) {
            this.scalarVariables.push({ name: thisNode.textContent, type: ScalarVariableType.Real, causality: CausalityType.CalculatedParameter });
            thisNode = iterator.iterateNext();
        }
        
        
    }

    public getScalarVariable(name: string): ScalarVariable {
        let res = this.scalarVariables.find(function (s) { return s.name == name; });
        if (res == undefined) {
            return null;
        }
        return res;
    }
}

// Defined enums for all FMI supported platforms
export enum Platfomrs { Mac64, Linux32, Linux64, Win32, Win64 };

// Represents a FMI ScalarVariable
export class ScalarVariable {
    name: string;

    type: ScalarVariableType;
    causality: CausalityType;
}
export enum ScalarVariableType { Real, Bool, Int, String };
export enum CausalityType { Output, Input, Parameter ,CalculatedParameter};

// Repersents an instance of an FMU, including initial parameters and a mapping from outputs to InstanceScalarPair
export class Instance {
    //the fmu which this is an instance of
    fmu: Fmu;
    //the instance name
    name: string;

    //mapping from output to FmuConnection where connection holds an instane and input scalarVariable
    outputsTo: Map<ScalarVariable, InstanceScalarPair[]> = new Map<ScalarVariable, InstanceScalarPair[]>();

    // initial parameter values
    initialValues: Map<ScalarVariable, any> = new Map<ScalarVariable, any>();

    constructor(fmu: Fmu, name: string) {
        this.fmu = fmu;
        this.name = name;
    }

    public addOutputToInputLink(source: ScalarVariable, target: InstanceScalarPair) {

        if (this.outputsTo.has(source)) {
            let list = this.outputsTo.get(source);

            let match = list.find(function (pair) { return pair.instance == target.instance && pair.scalarVariable == target.scalarVariable });

            if (match == undefined) {
                list.push(target);
            }

        } else {
            this.outputsTo.set(source, [target]);
        }
    }
}

// Represents a link pair (FmuInstances, scalarVariable)
export class InstanceScalarPair {
    instance: Instance;
    scalarVariable: ScalarVariable;

    constructor(instance: Instance, scalarVariable: ScalarVariable) {
        this.instance = instance;
        this.scalarVariable = scalarVariable;
    }



}

