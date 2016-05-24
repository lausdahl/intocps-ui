
import * as Configs from "../../intocps-configurations/intocps-configurations";
import {Variable} from "./Variable";
import {InstanceListElement} from "../connections/connections-instance-element";
import {Component} from "../components/component";

export class Parameters {
    private instanceListUI: HTMLUListElement;
    private selectedInstance: InstanceListElement<Configs.Instance>;
    private instances: Array<InstanceListElement<Configs.Instance>> = [];

    private variableListUI: HTMLUListElement;
    private variables: Array<Variable> = [];

    private addButtonUI: HTMLButtonElement;

    private multiModelConfig: Configs.MultiModelConfig;

    private container: HTMLDivElement;

    constructor(loadedCallback: (parameters: Parameters) => void, multiModelConfig: Configs.MultiModelConfig) {
        this.multiModelConfig = multiModelConfig;
        this.loadHtml(loadedCallback);
    }

    private loadHtml(loadedCallback: (parameters: Parameters) => void) {
        let self = this;
        let promises = new Array<Promise<void>>();
        $("<div>").load("multimodel/parameters/parameters.html", function (event: JQueryEventObject) {
            self.container = <HTMLDivElement>(<HTMLDivElement>this).firstChild;
            self.initializeUI();
            self.multiModelConfig.fmus.forEach((val: Configs.Fmu) => {
                self.multiModelConfig.fmuInstances.filter((val2: Configs.Instance) => {
                    return val2.fmu === val;
                }).forEach((val2: Configs.Instance) => {
                    promises.push(self.addInstance(val2));
                });
            });
            Promise.all(promises).then(() => {
                loadedCallback(self);
            })
        });
    }

    private initializeUI() {
        this.instanceListUI = <HTMLUListElement>this.container.querySelector("#instances");
        this.variableListUI = <HTMLUListElement>this.container.querySelector("#variables");
        this.addButtonUI = <HTMLButtonElement>this.container.querySelector("#add");
        this.addButtonUI.onclick = this.onAddVariable.bind(this);
    }

    //Used by both output instances and input instances
    private addInstance(instance: Configs.Instance) {
        let promise = new Promise<void>((resolve, reject) => {
            let self = this;
            $('<div>').load("multimodel/connections/list-element.html", function (event: BaseJQueryEventObject) {
                let html: HTMLLinkElement = <HTMLLinkElement>(<HTMLDivElement>this).firstChild;
                let element: InstanceListElement<Configs.Instance> = new InstanceListElement(html, instance.fmu.name + "." + instance.name, self.onInstanceSelect.bind(self), instance);
                self.instanceListUI.appendChild(html);
                self.instances.push(element);
                resolve();
            });
        });
        return promise;
    }

    private getUnsetValues(instance: Configs.Instance) {
        return instance.fmu.scalarVariables.filter(value => {
            return (value.causality == Configs.CausalityType.CalculatedParameter) &&
                (instance.initialValues.get(value) == null);
        });
    }

    // Refresh all the variables by removing and readding
    private updateScalars(selectedInstance: Configs.Instance) {
        //Clear the containers
        this.variables.forEach(element => {
            this.variableListUI.removeChild(element.getContainer());
        });
        this.variables.length = 0;


        let unsetValues = this.getUnsetValues(selectedInstance);
        selectedInstance.initialValues.forEach((value: any, key: Configs.ScalarVariable) => {
            this.addVariable(unsetValues, key, value);
        });

        this.updateAddButton();
    }

    private updateAddButton() {
        let unsetValues = this.getUnsetValues(this.selectedInstance.getInstance());

        if (unsetValues.length > 0) {
            Component.show(this.addButtonUI);
        }
        else {
            Component.hide(this.addButtonUI);
        }
    }

    // Deselects any other instance
    private onInstanceSelect(instance: InstanceListElement<Configs.Instance>) {
        this.selectedInstance = instance;
        this.instances.forEach(element => {
            if (element !== this.selectedInstance) {
                element.deselect();
            }
        });
        this.updateScalars(instance.getInstance());
    }

    private onAddVariable() {
        this.addVariable(this.getUnsetValues(this.selectedInstance.getInstance()));
    }

    private onScalarNameChange(variable: Variable, prevScalar: Configs.ScalarVariable) {
        let initialValues = this.selectedInstance.getInstance().initialValues;
        
        // Remove the old scalar from initial values
        initialValues.delete(prevScalar);
        
        // If the scalar does not exist in initial values, then add it
        if (initialValues.get(variable.getVariable()) == null) {
            initialValues.set(variable.getVariable(), variable.getValue());
        }
        // Refresh the dropdowns containing the possible variable names
        this.variables.forEach(element => {
            element.updateVariableNames(this.getUnsetValues(this.selectedInstance.instance));
        });

        // Refresh the add button
        this.updateAddButton();
    }
    
    private onScalarValueChange(variable: Variable) {
        // If the scalar value does not exist, then do not set the value. It will be set once a scalar variable is chosen.
        if (this.selectedInstance.getInstance().initialValues.get(variable.getVariable()) != null) {
            this.selectedInstance.getInstance().initialValues.set(variable.getVariable(), variable.getValue());
        }
    }

    // Adds a variable to the UI.
    private addVariable(allVariables: Array<Configs.ScalarVariable>, key?: Configs.ScalarVariable, value?: any) {
        let loadedCallback = (variable: Variable) => {
            this.variableListUI.appendChild(variable.getContainer());
        }
        let variable = new Variable(loadedCallback.bind(this), allVariables, this.removeVariable.bind(this), key, value);
        variable.setVariableNameChangedCallback(this.onScalarNameChange.bind(this));
        variable.setOnScalarValueChangeCallback(this.onScalarValueChange.bind(this));
        this.variables.push(variable);
    }

    // Remove the given variable from initialValues and update the scalar list
    private removeVariable(variable: Variable) {
        if (this.selectedInstance.getInstance().initialValues.has(variable.getVariable())) {
            this.selectedInstance.getInstance().initialValues.delete(variable.getVariable())
        }

        this.onInstanceSelect(this.selectedInstance);
    }

    getContainer() {
        return this.container;
    }


}