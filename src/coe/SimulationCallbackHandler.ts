
// TODO: DUMMY REFERENCE UNTIL CHART MAKES A TYPESCRIPT DEFINITION FILE!
/// <reference path="Chart.d.ts"/>
/// <reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
/// <reference path="../../typings/browser/ambient/node/index.d.ts"/>
/// <reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/lib.es6.d.ts" />

import * as Main from  "../settings/settings"
import * as IntoCpsApp from  "../IntoCpsApp"
import {IntoCpsAppEvents} from "../IntoCpsAppEvents";
import * as Collections from 'typescript-collections';
import {CoeConfig} from './CoeConfig'

export class SimulationCallbackHandler {

    public chart: Chart;
    public chartIds: string[] = [];
    connect(url: string) {

        var websocket = new WebSocket(url);
        let _this = this;
        websocket.onopen = function (evt) { _this.onOpen(evt) };
        websocket.onclose = function (evt) { _this.onClose(evt) };
        websocket.onmessage = function (evt) { _this.onMessage(evt) };
        websocket.onerror = function (evt) { _this.onError(evt) };


        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = '.string { color: green; } .number { color: darkorange; } .boolean { color: blue; } .null { color: magenta; } .key { color: red; } ';
        document.getElementsByTagName('head')[0].appendChild(style);
    }

    onOpen(evt: any) {
        this.output("CONNECTED");
    }

    onClose(evt: any) {
        this.output('<span style="color: orange;">CLOSE: </span> ')
        this.output("DISCONNECTED");
    }

    onMessage(evt: any) {
        let _this = this;
        var jsonData = JSON.parse(evt.data);
        var str = JSON.stringify(jsonData, undefined, 4);
        this.output(this.syntaxHighlight(str));

        //calculate id

        $.each(Object.keys(jsonData), function (j, fmukey) {
            if (fmukey.indexOf("{") == 0) {
                let preFix = fmukey + ".";
                $.each(Object.keys(jsonData[fmukey]), function (k, instanceKey) {
                    let id = preFix + instanceKey + ".";
                    $.each(Object.keys(jsonData[fmukey][instanceKey]), function (j, outputKey) {
                        let key = id + outputKey;
                        var value = jsonData[fmukey][instanceKey][outputKey];
                        $.each(_this.chartIds, function (index, datasetKey) {
                            if (datasetKey == key) {

                                if (value == "true")
                                { value = 1 }
                                else if (value == "false")
                                { value = 0; }

                                _this.chart.data.datasets[index].data.push(value);

                            }
                        });
                    });
                });
            }
        });

        this.chart.update();
    }

    onError(evt: any) {
        this.output('<span style="color: red;">ERROR:</span> ' + evt.data);
    }

    output(inp: string) {

        let div = <HTMLInputElement>document.getElementById("coe-callback");

        let pre = document.createElement('pre');

        /* pre {outline: 1px solid #ccc; padding: 5px; margin: 5px; }
    .string { color: green; }
    .number { color: darkorange; }
    .boolean { color: blue; }
    .null { color: magenta; }
    .key { color: red; } */
        pre.style.outline = "1px solid #ccc";
        pre.style.padding = "5px";
        pre.style.margin = "5px";


        pre.innerHTML = inp;
        div.appendChild(pre);

        //document.body.appendChild(document.createElement('pre')).innerHTML = inp;
    }

    syntaxHighlight(json: string) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }
}


