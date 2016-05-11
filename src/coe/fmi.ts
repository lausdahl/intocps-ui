///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />

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

    public populate() {
        let self = this;
        var fs = require("fs");
        try {
            if (fs.accessSync(this.path, fs.R_OK)) {
                return;
            }

            var JSZip = require("jszip");

            // read a zip file
            fs.readFile(this.path, function (err: any, data: any) {
                if (err) throw err;
                var zip = new JSZip();

                zip.loadAsync(data).then(function (k: any) {
                    let md = zip.file("modelDescription.xml").async("string")
                        .then(function (content: string) {

                            var oParser = new DOMParser();
                            var oDOM = oParser.parseFromString(content, "text/xml");
                            var iterator = document.evaluate('//ScalarVariable[@causality="output"]/@name', oDOM, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

                            var thisNode = iterator.iterateNext();

                            while (thisNode) {
                                self.scalarVariables.push({ name: thisNode.textContent, type: ScalarVariableType.Real, causality: CausalityType.Output });
                                thisNode = iterator.iterateNext();
                            }

                            var iterator = document.evaluate('//ScalarVariable[@causality="input"]/@name', oDOM, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

                            var thisNode = iterator.iterateNext();

                            while (thisNode) {
                                self.scalarVariables.push({ name: thisNode.textContent, type: ScalarVariableType.Real, causality: CausalityType.Input });
                                thisNode = iterator.iterateNext();
                            }

                        });
                });
            });



        } catch (e) {
            console.error(e);
           throw e;
        }
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
export enum CausalityType { Output, Input, Parameter };

// Repersents an instance of an FMU, including initial parameters and a mapping from outputs to InstanceScalarPair
export class Instance {
    //the fmu which this is an instance of
    fmu: Fmu;
    //the instance name
    name: string;

    //mapping from output to FmuConnection where connection holds an instane and input scalarVariable
    outputsTo: Map<ScalarVariable, InstanceScalarPair> = new Map<ScalarVariable, InstanceScalarPair>();

    // initial parameter values
    initialValues: Map<ScalarVariable, any> = new Map<ScalarVariable, any>();
}

// Represents a link pair (FmuInstances, scalarVariable)
export class InstanceScalarPair {
    instance: Instance;
    scalarVariable: ScalarVariable;
}