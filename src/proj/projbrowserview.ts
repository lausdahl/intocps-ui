///<reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
///<reference path="../../typings/browser/ambient/node/index.d.ts"/>
///<reference path="../../typings/browser/ambient/jquery/index.d.ts"/>
///<reference path="../../typings/browser/ambient/w2ui/index.d.ts"/>

import {IntoCpsAppEvents} from "../IntoCpsAppEvents";
import {IntoCpsApp} from  "../IntoCpsApp"
import {Project} from "./Project";
import {IProject} from "./IProject";
import fs = require('fs');
import Path = require('path');

import {IntoCpsAppMenuHandler} from "../IntoCpsAppMenuHandler";
import {eventEmitter} from "../Emitter";

export class ProjectBrowserItem {
    id: string;
    text: string;
    level: number;
    expanded: boolean = false;
    img: any = null;
    nodes: ProjectBrowserItem[] = [];
    parent: ProjectBrowserItem;
    group: boolean = false;

    clickHandler(): void { }
    dblClickHandler(): void { }

    constructor(path: string, parent: ProjectBrowserItem) {
        this.id = path;
        this.text = Path.basename(path);
        this.parent = parent;
        if (parent == null) {
            this.level = 0;
            this.group = true;
            this.expanded = true;
        } else {
            this.level = parent.level + 1;
            parent.nodes.push(this);
        }
    }
    removeFileExtensionFromText(): void {
        this.text = this.text.substr(0, this.text.indexOf('.'));
    }
    removeNodeWithPath(path: string): void {
        this.nodes = this.nodes.filter(function (n: ProjectBrowserItem) {
            return n.id != path;
        });
    }

}

export class BrowserController {
    private browser: HTMLDivElement;
    private tree: W2UI.W2Sidebar;
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
            this.clearAll();
            this.addToplevelNodes(this.addFSFolderContent(app.getActiveProject().getRootFilePath()));
        }
    }


    private addFSItem(path: string, parent: ProjectBrowserItem): ProjectBrowserItem {
        var _this = this;
        var result: ProjectBrowserItem = result = new ProjectBrowserItem(path, parent);
        var stat = fs.statSync(path);
        if (Path.basename(path).startsWith('.')) {
            return null;
        }
        if (stat.isFile()) {
            if (path.endsWith('.coe.json')) {
                //merge MultiModelConfig and folder
                parent.img = 'glyphicon glyphicon-copyright-mark';
                (<any>parent).coeConfig = path;
                parent.removeNodeWithPath(path);
                parent.dblClickHandler = function () {
                    _this.menuHandler.openCoeView(path);
                };
                result = null;
            }
            else if (path.endsWith('.mm.json')) {
                //merge MultiModelConfig and folder
                parent.img = 'glyphicon glyphicon-briefcase';
                (<any>parent).mmConfig = path;
                parent.removeNodeWithPath(path);
                parent.dblClickHandler = function () {
                    _this.menuHandler.openMultiModel(path);
                };
                result = null;
            }
            else if (path.endsWith('.fmu')) {
                result.img = 'icon-page';
                result.removeFileExtensionFromText();
                parent.dblClickHandler = function () {
                    _this.menuHandler.openFmu(path);
                };
            }
            else if (path.endsWith('.sysml.json')) {
                result.img = 'glyphicon glyphicon-tasks';
                result.removeFileExtensionFromText();
                result.dblClickHandler = function () {
                    _this.menuHandler.openSysMlExport(path);
                };
                //children.push(new Container(name, filePath, ContainerType.SysMLExport));
            }
            else if (path.endsWith('.emx')) {
                result.img = 'glyphicon glyphicon-tree-conifer';
                result.removeFileExtensionFromText();
                //children.push(new Container(name, filePath, ContainerType.EMX));
            }
            else if (path.endsWith('.mo')) {
                result.img = 'glyphicon glyphicon-tree-deciduous';
                result.removeFileExtensionFromText();
                //children.push(new Container(name, filePath, ContainerType.MO));
            }
            else if (path.endsWith('.csv')) {
                result.img = 'glyphicon glyphicon-th-list';
                result.removeFileExtensionFromText();
                //children.push(new Container(name, filePath, ContainerType.CSV));
            }
        } else if (stat.isDirectory()) {
            result.img = 'icon-folder';
            if (this.isOvertureProject(path)) {
                result.img = 'glyphicon glyphicon-leaf';
                result.expanded = false;
            } else if (name.indexOf("R_") == 0) {
                result.img = 'glyphicon glyphicon-barcode';
            }
            var children: ProjectBrowserItem[] = this.addFSFolderContent(path, result);
        }
        return result;
    }

    private addFSFolderContent(path: string, parent: ProjectBrowserItem = null): ProjectBrowserItem[] {
        var result: ProjectBrowserItem[] = [];
        var fs = require('fs');
        var _this = this;
        fs.readdirSync(path).forEach(function (name: string) {
            var filePath: string = Path.join(path, name);
            var ret = _this.addFSItem(filePath, parent);
            if (ret != null) {
                result.push(ret);
            }
        });
        return result;
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

    private addHandlers() {
        this.tree.on("dblClick", (event: JQueryEventObject) => {
            //Remove auto expansion on double click
            event.preventDefault();
            var item: ProjectBrowserItem = <ProjectBrowserItem>((<any>event).object);
            item.dblClickHandler();
        });

        this.tree.on("click", (event: JQueryEventObject) => {
            var item: ProjectBrowserItem = <ProjectBrowserItem>((<any>event).object);
            item.clickHandler();
        });
    }

    getSelectedId(): string {
        return this.tree.selected;
    }


    /*
    Utility function to determin if the container holds an Overture Project. TODO: Should this be annotated in the container instead.
     */
    private isOvertureProject(path: string): boolean {

        let projectFile = Path.normalize(Path.join(path, ".project"));

        try {
            if (!fs.accessSync(projectFile, fs.R_OK)) {
                let content = fs.readFileSync(projectFile, "UTF-8");
                return content.indexOf("org.overture.ide.vdmrt.core.nature") >= 0;

            }
        } catch (e) {

        }
        return false;
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
