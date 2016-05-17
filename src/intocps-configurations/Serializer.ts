
///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />


import * as Collections from 'typescript-collections';
import * as Fmi from "../coe/fmi";
import {MultiModelConfig} from "./MultiModelConfig"


import Path = require('path');

import {Parser} from "./Parser";

export  class Serializer extends Parser {

    public toObjectMultiModel(multiModel: MultiModelConfig): any {
        var obj: any = {};
        //fmus
        obj[this.FMUS_TAG] = this.toObjectFmus(multiModel.fmus);
        //connections
        obj[this.CONNECTIONS_TAG] = this.toObjectConnections(multiModel.fmuInstances);
        //parameters
        obj[this.PARAMETERS_TAG] = this.toObjectParameters(multiModel.fmuInstances);
        
        return obj;
    }

    //convert fmus to JSON
    private toObjectFmus(fmus: Fmi.Fmu[]): any {
        var data: any = new Object();

        fmus.forEach((fmu: Fmi.Fmu) => {
            data[fmu.name] = fmu.path;
        });

     
        return data;
    }

//util method to obtain id from instance
  private  getId(value: Fmi.Instance): string {
        return value.fmu.name + "." + value.name;
    }

//util method to obtain full id from instance and scalarvariable
private    getIdSv(value: Fmi.Instance, sv: Fmi.ScalarVariable): string {
        return value.fmu.name + "." + value.name + "." + sv.name;
    }

    //toObjectConnections
    toObjectConnections(fmuInstances: Fmi.Instance[]): any {
        var cons: any = new Object();

        fmuInstances.forEach(value => {
            value.outputsTo.forEach((pairs, sv) => {
                let key = this.getIdSv(value, sv);
                var inputs: any[] = [];
                pairs.forEach(pair => {
                    let input = this.getIdSv(pair.instance, pair.scalarVariable);
                    inputs.push(input);
                });

                cons[key] = inputs;
            });
        });

        return cons;
    }


    //to JSON parameters
    toObjectParameters(fmuInstances: Fmi.Instance[]): any {
        var obj: any = new Object();

        fmuInstances.forEach(instance => {
            instance.initialValues.forEach((value, sv) => {
                obj[this.getIdSv(instance,sv)]=value;
            });
        });

        return obj;
    }


    toObjectLivestream(livestream: Map<String, Collections.LinkedList<String>>): any {
        var cons: any = new Object();
        livestream.forEach((value: Collections.LinkedList<String>, index: String) => {

            var inputs: any[] = [];
            value.forEach((input) => {
                inputs.push(input);
            });

            cons[index + ""] = inputs;
        })


        var constagged: any = new Object();
        constagged[this.LIVESTREAM_TAG] = cons;
        return constagged;
    }
}