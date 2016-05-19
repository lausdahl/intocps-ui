import * as Configs from "../../intocps-configurations/intocps-configurations";
import {ListElement} from "./list-element"
import {InstanceListElement} from "./connections-instance-element";
import {CheckboxInstanceListElement} from "./checkbox-list-element";


enum InstanceSelection {
    Input,
    Output
}

enum Containers {
    OutputVariables = 1 << 0,
    InputInstances = 1 << 1,
    inputVariables = 1 << 2
}

export class ConnectionsElement {

    outputInstanceList: HTMLUListElement;
    selectedOutputInstance: InstanceListElement<Configs.Instance>;
    outputInstances: Array<InstanceListElement<Configs.Instance>> = [];

    outputVariableList: HTMLUListElement;
    selectedOutputVariable: InstanceListElement<Configs.ScalarVariable>;
    outputVariables: Array<InstanceListElement<Configs.ScalarVariable>> = [];

    inputInstanceList: HTMLUListElement;
    selectedInputInstance: InstanceListElement<Configs.Instance>;
    inputInstances: Array<InstanceListElement<Configs.Instance>> = [];

    inputVariableList: HTMLUListElement;
    inputVariables: Array<InstanceListElement<Configs.ScalarVariable>> = [];

    private container: HTMLDivElement;

    multiModelDOM: Configs.MultiModelConfig;
    self: ConnectionsElement;

    constructor(container: HTMLDivElement) {
        this.container = container;
        this.outputInstanceList = <HTMLUListElement>this.container.querySelector("#connections-output-instances");
        this.outputVariableList = <HTMLUListElement>this.container.querySelector("#connections-output-variables");
        this.inputInstanceList = <HTMLUListElement>this.container.querySelector("#connections-input-instances");
        this.inputVariableList = <HTMLUListElement>this.container.querySelector("#connections-input-variables");
        this.self = this;
    }

    addData(multiModelDOM: Configs.MultiModelConfig) {
        this.multiModelDOM = multiModelDOM;
        this.updateInstances(this.addInstance.bind(this), InstanceSelection.Output);
    }

    // Show the instances
    private updateInstances(addCallback: (instance: Configs.Instance, instanceSelection: InstanceSelection) => void, instanceSelection: InstanceSelection): void {
        this.multiModelDOM.fmus.forEach((val: Configs.Fmu) => {
            this.multiModelDOM.fmuInstances.filter((val2: Configs.Instance) => {
                return val2.fmu === val;
            }).forEach((val2: Configs.Instance) => {
                addCallback(val2, instanceSelection);
            });
        });
    }

    //Used by both output instances and input instances
    private addInstance(instance: Configs.Instance, instanceSelection: InstanceSelection) {
        let self = this;
        $('<div>').load("multimodel/connections/list-element.html", function (event: BaseJQueryEventObject) {
            let html: HTMLLinkElement = <HTMLLinkElement>(<HTMLDivElement>this).firstChild;

            if (instanceSelection == InstanceSelection.Output) {
                let output: InstanceListElement<Configs.Instance> = new InstanceListElement(html, instance.fmu.name + "." + instance.name, self.outputInstanceSelected.bind(self), instance);
                self.outputInstanceList.appendChild(html);
                self.outputInstances.push(output);
            }
            else if (instanceSelection == InstanceSelection.Input) {
                let output: InstanceListElement<Configs.Instance> = new InstanceListElement(html, instance.fmu.name + "." + instance.name, self.inputInstanceSelected.bind(self), instance);
                self.inputInstanceList.appendChild(html);
                self.inputInstances.push(output);
            }
        });
    }

    //Show output variables
    private outputInstanceSelected(instanceElement: InstanceListElement<Configs.Instance>) {
        this.selectedOutputInstance = instanceElement;
        this.outputInstances.forEach(element => {
            if (element !== instanceElement) {
                element.deselect();
            }
        });
        //Clear the containers
        this.clearContainers(Containers.InputInstances | Containers.inputVariables | Containers.OutputVariables);

        (<Configs.Instance>instanceElement.getInstance()).fmu.scalarVariables.forEach(element => {
            this.addOutputVariable(element);
        });
    }

    private addOutputVariable(variable: Configs.ScalarVariable) {
        let self = this;
        $('<div>').load("multimodel/connections/list-element.html", function (event: BaseJQueryEventObject) {
            let html: HTMLLinkElement = <HTMLLinkElement>(<HTMLDivElement>this).firstChild;
            self.outputVariableList.appendChild(html);
            let output: InstanceListElement<Configs.ScalarVariable> = new InstanceListElement(html, variable.name, self.outputVariableSelected.bind(self), variable);
            self.outputVariables.push(output);
        });
    }

    private outputVariableSelected(variable: InstanceListElement<Configs.ScalarVariable>) {
        this.selectedOutputVariable = variable;
        this.outputVariables.forEach(element => {
            if (element !== variable) {
                element.deselect();
            }
        });
        this.clearContainers(Containers.InputInstances | Containers.inputVariables);
        this.updateInstances(this.addInstance.bind(this), InstanceSelection.Input);
    }

    //Show input variables
    private inputInstanceSelected(instanceElement: InstanceListElement<Configs.Instance>) {
        this.selectedInputInstance = instanceElement;
        this.inputInstances.forEach(element => {
            if (element !== instanceElement) {
                element.deselect();
            }
        });
        this.clearContainers(Containers.inputVariables);
        this.addInputVariables(this.selectedInputInstance.getInstance());
    }

    private addInputVariables(instance: Configs.Instance) {
        // The retrieves all the connected scalar pairs
        let connectedInputVariables: Configs.ScalarVariable[] = ((): Configs.ScalarVariable[] => {
            // Gets the list of scalar pairs that the selected output variable is connected to
            let instanceScalarPairs: Configs.InstanceScalarPair[] = this.selectedOutputInstance.getInstance().outputsTo.get(this.selectedOutputVariable.getInstance());
            if (instanceScalarPairs != null) {
                // Gets the list of scalar pairs for the selected input instance
                let relevantPairs: Configs.InstanceScalarPair[] = instanceScalarPairs.filter((element: Configs.InstanceScalarPair) => {
                    return element.instance === instance;
                });
                if (relevantPairs.length > 0) {
                    // Returns the scalar variables
                    return relevantPairs.map((element: Configs.InstanceScalarPair) => {
                        return element.scalarVariable;
                    });
                }
            }
            return [];
        })();
        let allInputVariables: Configs.ScalarVariable[] = instance.fmu.scalarVariables.filter((element: Configs.ScalarVariable) => {
            console.log(element.type);
            return (element.causality == Configs.CausalityType.Input) && (element.type == this.selectedOutputVariable.getInstance().type);
        });
        allInputVariables.forEach(element => {
            this.addInputVariable(element, connectedInputVariables.indexOf(element) > -1);
        });

    }

    private addInputVariable(variable: Configs.ScalarVariable, selected: boolean) {
        let self = this;
        $('<div>').load("multimodel/connections/input.html", function (event: BaseJQueryEventObject) {
            let html: HTMLLinkElement = <HTMLLinkElement>(<HTMLDivElement>this).firstChild;
            self.inputVariableList.appendChild(html);
            let output: CheckboxInstanceListElement<Configs.ScalarVariable> = new CheckboxInstanceListElement(html, variable.name, self.inputVariableSelected.bind(self), variable);
            output.setCheckboxState(selected);
            self.inputVariables.push(output);
        });
    }

    private inputVariableSelected(variable: CheckboxInstanceListElement<Configs.ScalarVariable>) {
        // Check if an entry exists in the map for the given output variable        
        let getOutputsTo: () => Configs.InstanceScalarPair[] = () => { 
             return this.selectedOutputInstance.getInstance().outputsTo.get(this.selectedOutputVariable.getInstance());    
        };
        let outputsTo = getOutputsTo();
        
        //Filter ruins the ordering and so forth. Therefore it can only be used to check if a given element exists, and possibly return the given element.
        
        if (variable.getChecked()) {
            if (outputsTo == null) {
                this.selectedOutputInstance.getInstance().outputsTo.set(this.selectedOutputVariable.getInstance(), new Array<Configs.InstanceScalarPair>());
                outputsTo = getOutputsTo();
            }
            // Add the instance and variable to outputs to
            outputsTo.push(new Configs.InstanceScalarPair(this.selectedInputInstance.getInstance(), variable.getInstance()));
        }
        else {
            let index = outputsTo.findIndex((element: Configs.InstanceScalarPair) => {
                return (element.instance === this.selectedInputInstance.getInstance()) && (element.scalarVariable === variable.getInstance())
            });
            // Remove the instance scalar pair
            outputsTo.splice(index, 1);
        }
    }

    //Clear the list containers
    private clearContainers(containers: Containers) {
        let clearContainer = <T>(container: HTMLUListElement, connectionElements: Array<InstanceListElement<T>>, selected?: InstanceListElement<T>) => {
            if (selected != null)
                selected = undefined;

            connectionElements.forEach(element => {
                container.removeChild(element.getHtml());
            });
            connectionElements.splice(0);
        }

        if (containers & Containers.OutputVariables) {
            clearContainer(this.outputVariableList, this.outputVariables, this.selectedOutputVariable);
        }
        if (containers & Containers.InputInstances) {
            clearContainer(this.inputInstanceList, this.inputInstances, this.selectedInputInstance);
        }
        if (containers & Containers.inputVariables) {
            clearContainer(this.inputVariableList, this.inputVariables);
        }
    }
}