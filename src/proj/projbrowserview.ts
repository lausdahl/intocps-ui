//TODO: DUMMY REFERENCE UNTIL CHART MAKES A TYPESCRIPT DEFINITION FILE!

///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
///<reference path="../../typings/browser/ambient/w2ui/index.d.ts"/>

import {IntoCpsAppEvents} from "../IntoCpsAppEvents";
import * as IntoCpsApp from  "../IntoCpsApp"
import {ContentProvider} from "../proj/ContentProvider";
import {Container} from "../proj/Container";
import {ContainerType} from "../proj/Container";

import {CoeController} from "../coe/coe";

export class BrowserController {
    private browser: HTMLDivElement;
    private tree: W2UI.W2Sidebar;
    private clickHandlers: Array<(event: JQueryEventObject) => void> = [];
    private dblClickHandlers: Array<(event: JQueryEventObject) => void> = [];

    private coeController: CoeController = null;

    constructor(coeController: CoeController) {
        this.coeController = coeController;
    }

    initialize() {
        let _this2 = this;
        this.browser = <HTMLDivElement>document.querySelector("#browser");
        let remote = require("remote");

        this.tree = $(this.browser).w2sidebar({
            name: 'sidebar',
        });

        this.addDblClickHandler((event: JQueryEventObject) => {
            console.info(event);

            if ((event.target + "").indexOf('coe.json') >= 0) {
                console.info("Coe config clicked");
                _this2.coeController.load(event.target + "");
            }
        });

        // this.exampleOfInitTreeNodes();
        this.addHandlers();
        let app: IntoCpsApp.IntoCpsApp = remote.getGlobal("intoCpsApp");
        if (app.getActiveProject() != null) {
            //TODO: Set tree view browser
            let root = new Container(app.getActiveProject().getName(), app.getActiveProject().getRootFilePath(), ContainerType.Folder);
            this.addToplevelNodes(this.buildProjectStructor(0, root));
        }
        var ipc = require('electron').ipcRenderer;
        ipc.on(IntoCpsAppEvents.PROJECT_CHANGED, function (event, arg) {
            //TODO: Set tree view browser
        });
    }

    private buildProjectStructor(level: number, root: Container): any {

        let _this = this;
        var items: any[] = [];
        let contentProvider: ContentProvider = new ContentProvider();

        contentProvider.getChildren(root).forEach((value: Container, index: number, array: Container[]) => {

            var item: any = new Object();
            item.id = value.filepath;
            item.text = value.name;
            item.expanded= true

            if (level == 0)
                item.group = true;


            switch (value.type) {
                case ContainerType.Folder:
                    {
                        item.img = 'icon-folder';
                        item.nodes = _this.buildProjectStructor(level + 1, value);
                         break;
                    };
                case ContainerType.FMU:
                    {
                        item.img = 'icon-page';
                         break;
                    };
                case ContainerType.MultiModelConfig:
                    {
                        item.img = 'glyphicon glyphicon-briefcase';
                         break;
                    };
                case ContainerType.CoeConfig:
                    {
                        item.img = 'glyphicon glyphicon-tasks';
                        break;
                    };

            }

            items.push(item);
        });

        console.info(items);
        return items;
    }

    private exampleOfInitTreeNodes() {
        this.addToplevelNodes([
            {
                id: 'Models', text: 'Models', img: 'icon-folder', group: true
            },
            {
                id: 'FMUs', text: 'FMUs', img: 'icon-folder', group: true
            },
            {
                id: 'Connections', text: 'Connections', img: 'icon-folder', group: true
            },
            {
                id: 'Multi-Models', text: 'Multi-Models', img: 'icon-folder', expanded: true, group: true,
                nodes: [{
                    id: 'Multi-Models-1', text: 'Multi-Model1', icon: 'glyphicon glyphicon-folder-open',
                    nodes: [
                        {
                            id: 'Multi-Models-1-1', text: 'SimWithControllerModeX', icon: 'glyphicon glyphicon-file',
                            nodes: [
                                { id: 'MM-1-1-1', text: 'Timestamp', icon: 'icon-page' },
                                { id: 'MM-1-1-2', text: 'Timestamp', icon: 'icon-page' }]
                        },
                        {
                            id: 'Multi-Models-1-2', text: 'SimWithControllerModeZ', icon: 'glyphicon glyphicon-file',
                            nodes: [
                                { id: 'MM-1-2-1', text: 'Timestamp', icon: 'icon-page' },
                                { id: 'MM-1-2-2', text: 'Timestamp', icon: 'icon-page' }]
                        },
                        {
                            id: 'Multi-Models-1-3', text: 'SimWithControllerModeY', icon: 'glyphicon glyphicon-file',
                            nodes: [
                                { id: 'MM-1-3-1', text: 'Timestamp', icon: 'icon-page' },
                                { id: 'MM-1-3-2', text: 'Timestamp', icon: 'icon-page' }]
                        }]

                },
                    {
                        id: 'Multi-Models-2', text: 'Multi-Model2', icon: 'glyphicon glyphicon-folder-open',
                        nodes: [
                            {
                                id: 'Multi-Models-2-1', text: 'SimWithControllerModeK', icon: 'glyphicon glyphicon-file',
                                nodes: [
                                    { id: 'MM-2-1-1', text: 'Timestamp', icon: 'icon-page' }]
                            }]

                    }
                ]
            },
            {
                id: 'Design Space Explorations', text: 'Design Space Explorations', img: 'icon-folder', expanded: true, group: true,
                nodes: [{
                    id: 'DSE-1', text: 'SimWithControllerX', icon: 'glyphicon glyphicon-file',
                    nodes: [{ id: 'DSE-1-1', text: 'Timestamp', icon: 'icon-page' }]
                }]
            }
        ]);
    }

    private exampleOfAddingNode() {
        let node: any = { id: 'fmu-waterTank', text: 'Water tank fmu', img: 'icon-folder' };
        let parent = "FMUs";
        this.addNodes(parent, node);
    }

    addToplevelNodes(nodes: Object | Object[]): Object {
        return this.tree.add(nodes);
    }

    addNodes(parentId: string, nodes: Object | Object[]): Object {
        return this.tree.add(parentId, nodes);
    }

    clearAll() {
        let ids: string[] = this.tree.nodes.map((value: any) => {
            return value.id
        });
        this.tree.remove.apply(this.tree, ids);
    }

    addClickHandler(clickHandler: (event: JQueryEventObject) => void) {
        this.clickHandlers.push(clickHandler);
    }

    addDblClickHandler(clickHandler: (event: JQueryEventObject) => void) {
        this.dblClickHandlers.push(clickHandler);
    }

    private addHandlers() {
        this.tree.on("dblClick", (event: JQueryEventObject) => {
            //Remove auto expansion on when double clicking
            event.preventDefault();
            this.dblClickHandlers.forEach(handler => {
                handler(event);
            })
        });

        this.tree.on("click", (event: JQueryEventObject) => {
            this.clickHandlers.forEach(handler => {
                handler(event);
            })
        });
    }

    getSelectedId(): string {
        return this.tree.selected;
    }
}