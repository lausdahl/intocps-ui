import * as Configs from "../../intocps-configurations/intocps-configurations";
import {OutputElement} from "./outputElement.ts"
import {ConnectionsInstanceElement} from "./connections-instance-element.ts";


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
    selectedOutputInstance: ConnectionsInstanceElement<Configs.Instance>;
    outputInstances: Array<ConnectionsInstanceElement<Configs.Instance>> = [];

    outputVariableList: HTMLUListElement;
    selectedOutputVariable: ConnectionsInstanceElement<Configs.ScalarVariable>;
    outputVariables: Array<ConnectionsInstanceElement<Configs.ScalarVariable>> = [];

    inputInstanceList: HTMLUListElement;
    selectedInputInstance: ConnectionsInstanceElement<Configs.Instance>;
    inputInstances: Array<ConnectionsInstanceElement<Configs.Instance>> = [];

    inputVariableList: HTMLUListElement;
    inputVariables: Array<ConnectionsInstanceElement<Configs.ScalarVariable>> = [];

    private container: HTMLDivElement;

    multiModelDOM: Configs.MultiModelConfig;

    constructor(container: HTMLDivElement) {
        this.container = container;
        this.outputInstanceList = <HTMLUListElement>this.container.querySelector("connections-output-instances");
        this.outputVariableList = <HTMLUListElement>this.container.querySelector("connections-output-variables");
        this.inputInstanceList = <HTMLUListElement>this.container.querySelector("connections-input-instances");
        this.inputVariableList = <HTMLUListElement>this.container.querySelector("connections-input-variables");
    }

    addData(multiModelDOM: Configs.MultiModelConfig) {
        this.multiModelDOM = multiModelDOM;
        this.updateInstances(this.addInstance, InstanceSelection.Output);
    }

    private updateInstances(addCallback: (instance: Configs.Instance, instanceSelection: InstanceSelection) => void, instanceSelection: InstanceSelection): void {
        this.multiModelDOM.fmus.forEach((val: Configs.Fmu) => {
            this.multiModelDOM.fmuInstances.filter((val2: Configs.Instance) => {
                return val2.fmu === val;
            }).forEach((val2: Configs.Instance) => {
                addCallback(val2, instanceSelection);
            })
        })
    }
    //Used by both output instances and input instances
    private addInstance(instance: Configs.Instance, instanceSelection: InstanceSelection) {
        let self = this;
        $('<div>').load("multimodel/connections/output.html", function (event: BaseJQueryEventObject) {
            let html: HTMLLinkElement = <HTMLLinkElement>(<HTMLDivElement>this).firstChild;

            if (instanceSelection == InstanceSelection.Output) {
                let output: ConnectionsInstanceElement<Configs.Instance> = new ConnectionsInstanceElement(html, instance.fmu.name + instance.name, self.outputInstanceSelected.bind(self), instance);
                self.outputInstanceList.appendChild(html);
                self.outputInstances.push(output);
            }
            else if (instanceSelection == InstanceSelection.Input) {
                let output: ConnectionsInstanceElement<Configs.Instance> = new ConnectionsInstanceElement(html, instance.fmu.name + instance.name, self.inputInstanceSelected.bind(self), instance);
                self.inputInstanceList.appendChild(html);
                self.inputInstances.push(output);
            }
        });
    }

    //Show output variables
    private outputInstanceSelected(instanceElement: ConnectionsInstanceElement<Configs.Instance>) {
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

    //Show input variables
    private inputInstanceSelected(instanceElement: ConnectionsInstanceElement<Configs.Instance>) {
        this.selectedInputInstance = instanceElement;
        this.inputInstances.forEach(element => {
            if (element !== instanceElement) {
                element.deselect();
            }
        });
        this.clearContainers(Containers.inputVariables);
        this.addInputVariables(this.selectedInputInstance.getInstance());
    }

    //Clear the list containers
    private clearContainers(containers: Containers) {
        let clearContainer = <T>(container: HTMLUListElement, connectionElements: Array<ConnectionsInstanceElement<T>>, selected?: ConnectionsInstanceElement<T>) => {
            if (selected != null)
                selected = undefined;

            connectionElements.forEach(element => {
                container.removeChild(element.getHtml());
            });
            connectionElements.splice(0);
        }

        if (containers == Containers.OutputVariables) {
            clearContainer(this.outputVariableList, this.outputVariables, this.selectedOutputVariable);
        }
        if (containers == Containers.InputInstances) {
            clearContainer(this.inputInstanceList, this.inputInstances, this.selectedInputInstance);
        }
        if (containers == Containers.inputVariables) {
            clearContainer(this.inputVariableList, this.inputVariables);
        }
    }


    private addOutputVariable(variable: Configs.ScalarVariable) {
        let self = this;
        $('<div>').load("multimodel/connections/output.html", function (event: BaseJQueryEventObject) {
            let html: HTMLLinkElement = <HTMLLinkElement>(<HTMLDivElement>this).firstChild;
            self.outputVariableList.appendChild(html);
            let output: ConnectionsInstanceElement<Configs.ScalarVariable> = new ConnectionsInstanceElement(html, variable.name, self.outputVariableSelected.bind(self), variable);
            self.outputVariables.push(output);
        });
    }

    private outputVariableSelected(variable: ConnectionsInstanceElement<Configs.ScalarVariable>) {
        this.selectedOutputVariable = variable;
        this.clearContainers(Containers.InputInstances | Containers.inputVariables);
        this.updateInstances(this.addInstance, InstanceSelection.Input);
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
                    relevantPairs.map((element: Configs.InstanceScalarPair) => {
                        return element.scalarVariable;
                    });
                }
            }
            return [];
        })();
        let allInputVariables: Configs.ScalarVariable[] = instance.fmu.scalarVariables;
        allInputVariables.forEach(element => {
            this.addInputVariable(element, connectedInputVariables.includes(element));
        });
        
    }

    private addInputVariable(variable: Configs.ScalarVariable, selected: boolean) {
        let self = this;
        $('<div>').load("multimodel/connections/input.html", function (event: BaseJQueryEventObject) {
            let html: HTMLLinkElement = <HTMLLinkElement>(<HTMLDivElement>this).firstChild;
            this.inputVariableList.appendChild(html);
            let output: ConnectionsInstanceElement<Configs.ScalarVariable> = new ConnectionsInstanceElement(html, variable.name, self.inputVariableSelected.bind(self), variable);
            if(selected){
                output.select();
            }
            self.inputVariables.push(output);
        });
    }

    private inputVariableSelected(variable: ConnectionsInstanceElement<Configs.ScalarVariable>) {
        //Add it to outputs tp
    }
}