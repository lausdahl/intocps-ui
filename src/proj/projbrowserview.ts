///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
///<reference path="../../typings/browser/ambient/w2ui/index.d.ts"/>

import {IntoCpsAppEvents} from "../IntoCpsAppEvents";
import {IntoCpsApp} from  "../IntoCpsApp"
import {ContentProvider} from "./ContentProvider";
import {Container, ContainerType} from "./Container";
import {Project} from "./Project";
import {IProject} from "./IProject";
import fs = require('fs');
import Path = require('path');

import {IntoCpsAppMenuHandler} from "../IntoCpsAppMenuHandler";
import {eventEmitter} from "../Emitter";

export class BrowserController {
    private browser: HTMLDivElement;
    private tree: W2UI.W2Sidebar;
    private clickHandlers: Array<(event: JQueryEventObject) => void> = [];
    private dblClickHandlers: Array<(event: JQueryEventObject) => void> = [];

    private menuHandler: IntoCpsAppMenuHandler = null;

    private CTXT_DUBLICATE_ID: string = "Duplicate";
    private CTXT_DELETE_ID: string = "Duplicate";
    private CTXT_CREATE_MULTI_MODEL_ID: string = "create-multi-model";
    private CTXT_CREATE_CO_SIM_CONFIG_ID: string = "create-co-sim-config";
    private CTXT_IMPORT_ID: string = "import";
    private CTXT_EXPORT_ID: string = "export";
    private CTXT_CREATE_DSE_ID: string = "dse";
    private CTXT_CREATE_TEST_DATA_GERATION_PROJECT: string = "create test data generation project";
    private CTXT_CREATE_MODEL_CHECKING_PROJECT: string = "create model checking project";

    constructor(menuHandler: IntoCpsAppMenuHandler) {
        this.menuHandler = menuHandler;
    }

    initialize() {
        let self = this;
        this.browser = <HTMLDivElement>document.querySelector("#browser");
        let remote = require("remote");

        let DEFAULT_MENU = [
            // { id: this.CTXT_DUBLICATE_ID, text: "Duplicate", icon: 'glyphicon glyphicon-duplicate' },
            { id: this.CTXT_DELETE_ID, text: "Delete", icon: 'glyphicon glyphicon-remove' },
            // { id: this.CTXT_CREATE_MULTI_MODEL_ID, text: "Create Multi-Model", icon: 'glyphicon glyphicon-briefcase' },
            // { id: this.CTXT_CREATE_CO_SIM_CONFIG_ID, text: "Create Co-Simulation Configuration", icon: 'glyphicon glyphicon-copyright-mark' },
            { id: this.CTXT_IMPORT_ID, text: "Import", icon: 'glyphicon glyphicon-import' },
            { id: this.CTXT_EXPORT_ID, text: "Export", icon: 'glyphicon glyphicon-export' },
        ];

        this.tree = $(this.browser).w2sidebar({
            name: 'sidebar',
            menu: DEFAULT_MENU
        });

        let MM_MENU = [
            { id: this.CTXT_DUBLICATE_ID, text: "Duplicate", icon: 'glyphicon glyphicon-duplicate' },
            { id: this.CTXT_DELETE_ID, text: "Delete", icon: 'glyphicon glyphicon-remove' },
            { id: this.CTXT_CREATE_CO_SIM_CONFIG_ID, text: "Create Co-Simulation Configuration", icon: 'glyphicon glyphicon-copyright-mark' },
            { id: this.CTXT_IMPORT_ID, text: "Import", icon: 'glyphicon glyphicon-import' },
            { id: this.CTXT_EXPORT_ID, text: "Export", icon: 'glyphicon glyphicon-export' },
        ];

        let COSIM_MENU = [
            { id: this.CTXT_DUBLICATE_ID, text: "Duplicate", icon: 'glyphicon glyphicon-duplicate' },
            { id: this.CTXT_DELETE_ID, text: "Delete", icon: 'glyphicon glyphicon-remove' },
            { id: this.CTXT_IMPORT_ID, text: "Import", icon: 'glyphicon glyphicon-import' },
            { id: this.CTXT_EXPORT_ID, text: "Export", icon: 'glyphicon glyphicon-export' },
        ];

        let SYSML_EX_MENU = [
            { id: this.CTXT_CREATE_MULTI_MODEL_ID, text: "Create Multi-Model", icon: 'glyphicon glyphicon-briefcase' },
            { id: this.CTXT_DELETE_ID, text: "Delete", icon: 'glyphicon glyphicon-remove' },
            { id: this.CTXT_IMPORT_ID, text: "Import", icon: 'glyphicon glyphicon-import' },
            { id: this.CTXT_EXPORT_ID, text: "Export", icon: 'glyphicon glyphicon-export' },
        ];

        let DSE_MENU = [
            { id: this.CTXT_CREATE_DSE_ID, text: "Create Design Space Exploration Config", icon: 'glyphicon glyphicon-asterisk' },
        ];

        let TEST_DATA_GENERATION_MENU = [
            { id: this.CTXT_CREATE_TEST_DATA_GERATION_PROJECT, text: "Create Test Data Generation Project", icon: 'glyphicon glyphicon-asterisk' },
        ];

        let MODEL_CHECKING_MENU = [
            { id: this.CTXT_CREATE_MODEL_CHECKING_PROJECT, text: "Create Model Checking Project", icon: 'glyphicon glyphicon-asterisk' },
        ];

        this.tree.on("contextMenu", (event: any) => {
            console.log(event);
            let id: String = event.target + "";
            if (id.indexOf('mm.json') >= 0) {
                this.tree.menu = MM_MENU;
            } else if (id.indexOf('coe.json') >= 0) {
                this.tree.menu = COSIM_MENU;
            } else if (id.indexOf('sysml.json') >= 0) {
                this.tree.menu = SYSML_EX_MENU;
            } else if (Path.basename(id.toString()) == Project.PATH_TEST_DATA_GENERATION) {
                this.tree.menu = TEST_DATA_GENERATION_MENU;
            } else if (Path.basename(id.toString()) == Project.PATH_MODEL_CHECKING) {
                this.tree.menu = MODEL_CHECKING_MENU;
            } else if (Path.basename(id.toString()) == Project.PATH_DSE) {
                this.tree.menu = DSE_MENU;
            } else {
                this.tree.menu = DEFAULT_MENU;
            }
        });

        this.tree.on("menuClick", (event: any) => {

            var id: string = "";

            if (event.menuItem != undefined) {
                id = event.menuItem.id;
            }

            if (id == this.CTXT_CREATE_TEST_DATA_GERATION_PROJECT) {
                console.info("Create new test data generation project");
                this.menuHandler.createRTTesterProject(event.target);
            } else if (id == this.CTXT_CREATE_MODEL_CHECKING_PROJECT) {
                console.info("Create new model checking project");
                this.menuHandler.createRTTesterProject(event.target);
            } else if (id == this.CTXT_CREATE_DSE_ID) {
                console.info("Create new DSE config ");
                this.menuHandler.createDse(event.target);
            } else if (id.indexOf(this.CTXT_CREATE_MULTI_MODEL_ID) == 0) {
                if (event.target.indexOf('sysml.json') >= 0) {
                    console.info("Create new multimodel for: " + event.target);
                    this.menuHandler.createMultiModel(event.target + "");
                } else {
                    const { dialog } = require('electron').remote;
                    dialog.showErrorBox("Cannot create multi-model", "A multi-model cannot be created based on the selected resource.")
                }
            } else if (id.indexOf(this.CTXT_CREATE_CO_SIM_CONFIG_ID) == 0) {
                if (event.target.indexOf('mm.json') >= 0) {
                    console.info("Create new cosim config for: " + event.target);
                    this.menuHandler.createCoSimConfiguration(event.target + "");
                } else {
                    const { dialog } = require('electron').remote;
                    dialog.showErrorBox("Cannot create co-simulation configuration", "A co-simulation configuration cannot be created based on the selected resource.")
                }
            } else if (id.indexOf(this.CTXT_DELETE_ID) == 0) {
                let name = Path.basename(event.target);
                if (name.indexOf('R_') >= 0) {
                    console.info("Deleting " + event.target);
                    this.getCustomFs().removeRecursive(event.target, function (err: any, v: any) {
                        if (err != null) {
                            console.error(err);
                        }
                        self.refreshProjectBrowser();
                    });

                }

            }
        });


        this.addDblClickHandler((event: JQueryEventObject) => {
            console.info(event);
            let allowClick = true;
            if (this.menuHandler.deInitialize != null)
            { allowClick = this.menuHandler.deInitialize(); }
            if (allowClick) {
                let path = Path.normalize(event.target + "");
                if (path.indexOf('coe.json') >= 0) {
                    this.menuHandler.openCoeView(path);
                } else if (path.indexOf('mm.json') >= 0) {
                    this.menuHandler.openMultiModel(path);
                } else if (path.indexOf('sysml.json') >= 0) {
                    this.menuHandler.openSysMlExport(path);
                } else if (path.indexOf('.fmu') >= 0) {
                    this.menuHandler.openFmu(path);
                }
            }
        });

        this.addHandlers();

        this.refreshProjectBrowser();

        var ipc = require('electron').ipcRenderer;
        ipc.on(IntoCpsAppEvents.PROJECT_CHANGED, (event, arg) => {
            this.refreshProjectBrowser();
        });

        eventEmitter.on(IntoCpsAppEvents.PROJECT_CHANGED, () => {
            this.refreshProjectBrowser();
        });
    }

    //set and refresh the prowser content
    private refreshProjectBrowser() {

        let app: IntoCpsApp = IntoCpsApp.getInstance();
        if (app.getActiveProject() != null) {
            let root = new Container(app.getActiveProject().getName(), app.getActiveProject().getRootFilePath(), ContainerType.Folder);
            this.clearAll();
            this.addToplevelNodes(this.buildProjectStructor(app.getActiveProject(), 0, root, 3, []));
        }
    }

    private buildProjectStructor(project: IProject, level: number, root: Container, expandToLevel: number, skipContainers: Container[]): any {

        let _this = this;
        var items: any[] = [];
        let contentProvider: ContentProvider = new ContentProvider();

        contentProvider.getChildren(root).forEach((value: Container, index: number, array: Container[]) => {

            if (skipContainers.indexOf(value) >= 0) {
                return;
            }

            var name = value.name;
            if (name.indexOf('.') > 0) {
                name = name.substring(0, name.indexOf('.'));
            }

            var modifiedExpandLevel = expandToLevel;

            var item: any = new Object();
            item.id = value.filepath;
            item.text = name;
            item.expanded = true

            if (level == 0) {
                item.group = true;

                if (value.name.toLowerCase().indexOf(project.getSysMlFolderName().toLowerCase() + "") == 0) {
                    modifiedExpandLevel = 2;//modify expand level for SysML
                }
            }

            switch (value.type) {
                case ContainerType.Folder:
                    {
                        item.img = 'icon-folder';

                        //merge MultiModelConfig and folder
                        var autoRemoveChild = _this.getChildContainer(value, ContainerType.MultiModelConfig);
                        if (autoRemoveChild != null) {
                            item.img = 'glyphicon glyphicon-briefcase';
                            item.id = autoRemoveChild.filepath;
                        }
                        //merge CosimConfig
                        autoRemoveChild = _this.getChildContainer(value, ContainerType.CoeConfig);
                        if (autoRemoveChild != null) {
                            item.img = 'glyphicon glyphicon-copyright-mark';
                            item.id = autoRemoveChild.filepath;
                        }

                        if (level >= 5) {
                            //truncate content
                            item.nodes = [
                                {
                                    id: item.id + 'truncated', text: 'content truncated', img: 'glyphicon glyphicon-option-horizontal', group: false
                                }];
                        } else {
                            let autoremoveList: Container[] = autoRemoveChild == null ? [] : [autoRemoveChild];
                            item.nodes = _this.buildProjectStructor(project, level + 1, value, modifiedExpandLevel, autoremoveList);
                        }

                        if (level >= modifiedExpandLevel) {
                            item.expanded = false;
                        }

                        if (_this.isOvertureProject(value)) {
                            item.img = 'glyphicon glyphicon-leaf';
                            item.expanded = false;
                        } else if (name.indexOf("R_") == 0) {
                            item.img = 'glyphicon glyphicon-barcode';
                        }
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
                        item.img = 'glyphicon glyphicon-copyright-mark';
                        break;
                    };
                case ContainerType.SysMLExport:
                    {
                        item.img = 'glyphicon glyphicon-tasks';
                        break;
                    };
                case ContainerType.EMX:
                    {
                        item.img = 'glyphicon glyphicon-tree-conifer';
                        break;
                    };
                case ContainerType.MO:
                    {
                        item.img = 'glyphicon glyphicon-tree-deciduous';
                        break;
                    };
                case ContainerType.CSV:
                    {
                        item.img = 'glyphicon glyphicon-th-list';
                        break;
                    };



            }
            if (!(value.type == ContainerType.CoeConfig || value.type == ContainerType.MultiModelConfig)) {
                item.id = item.id.replace(/\\/g, "/");
                items.push(item)
            };
        });


        return items;
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
            //Remove auto expansion on double click
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


    /*
    Utility function to determin if the container holds an Overture Project. TODO: Should this be annotated in the container instead.
     */
    private isOvertureProject(container: Container): boolean {

        let projectFile = Path.normalize(container.getFilePath() + "/" + ".project");

        try {
            if (!fs.accessSync(projectFile, fs.R_OK)) {
                let content = fs.readFileSync(projectFile, "UTF-8");
                return content.indexOf("org.overture.ide.vdmrt.core.nature") >= 0;

            }
        } catch (e) {

        }
        return false;
    }

    private getChildContainer(root: Container, type: ContainerType) {
        let contentProvider: ContentProvider = new ContentProvider();

        let children = contentProvider.getChildren(root).filter((value) => { return value.getType() == type });

        if (children.length > 0)
            return children[0];

        return null;

    }

    private getCustomFs(): any {
        var fs = require('fs');
        fs.removeRecursive = function (path: string, cb: (err: any, v: any) => void) {
            var self = this;

            fs.stat(path, function (err: any, stats: any) {
                if (err) {
                    cb(err, stats);
                    return;
                }
                if (stats.isFile()) {
                    fs.unlink(path, function (err: any) {
                        if (err) {
                            cb(err, null);
                        } else {
                            cb(null, true);
                        }
                        return;
                    });
                } else if (stats.isDirectory()) {
                    // A folder may contain files
                    // We need to delete the files first
                    // When all are deleted we could delete the 
                    // dir itself
                    fs.readdir(path, function (err: any, files: any) {
                        if (err) {
                            cb(err, null);
                            return;
                        }
                        var f_length = files.length;
                        var f_delete_index = 0;

                        // Check and keep track of deleted files
                        // Delete the folder itself when the files are deleted

                        var checkStatus = function () {
                            // We check the status
                            // and count till we r done
                            if (f_length === f_delete_index) {
                                fs.rmdir(path, function (err: any) {
                                    if (err) {
                                        cb(err, null);
                                    } else {
                                        cb(null, true);
                                    }
                                });
                                return true;
                            }
                            return false;
                        };
                        if (!checkStatus()) {
                            for (var i = 0; i < f_length; i++) {
                                // Create a local scope for filePath
                                // Not really needed, but just good practice
                                // (as strings arn't passed by reference)
                                (function () {
                                    var filePath = path + '/' + files[i];
                                    // Add a named function as callback
                                    // just to enlighten debugging
                                    fs.removeRecursive(filePath, function removeRecursiveCB(err: any, status: any) {
                                        if (!err) {
                                            f_delete_index++;
                                            checkStatus();
                                        } else {
                                            cb(err, null);
                                            return;
                                        }
                                    });

                                })()
                            }
                        }
                    });
                }
            });
        };
        return fs;
    }

}
