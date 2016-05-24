import * as Configs from "../../intocps-configurations/intocps-configurations";
import {DropDown} from "../components/dropdown";
import {TextInput, TextInputState} from "../components/text-input";
export class Variable {
    private container: HTMLDivElement;

    private nameUI: HTMLDivElement;
    private nameDropDown: DropDown;

    private removeButton: HTMLButtonElement;
    private removeCallback: (variable: Variable) => void;

    private valueUI: HTMLDivElement;
    private valueField: TextInput;
    private value: string

    private selectedVariable: Configs.ScalarVariable;
    private allVariables: Array<Configs.ScalarVariable>
    private loadedCallback: (variable: Variable) => void;

    private nameChangedCallback: (variable: Variable, scalar?: Configs.ScalarVariable) => void;
    private scalarValueChangeCallback: (variable: Variable) => void;

    constructor(loadedCallback: (variable: Variable) => void, allVariables: Array<Configs.ScalarVariable>, removeCallback: (variable: Variable) => void, selectedVariable?: Configs.ScalarVariable, value?: string) {
        this.loadedCallback = loadedCallback;
        this.selectedVariable = selectedVariable;
        this.allVariables = allVariables;
        this.removeCallback = removeCallback;
        this.loadHtml(value);
    }

    private loadHtml(value?: string) {
        let self = this;
        $("<div>").load("multimodel/parameters/variable.html", function (event: JQueryEventObject) {
            self.container = <HTMLDivElement>(<HTMLDivElement>this).firstChild;
            self.initializeUI(value);
        });
    }

    private initializeUI(value?: string) {
        let uiPromises: Array<Promise<void>> = [];
        this.nameUI = <HTMLDivElement>this.container.querySelector("#name");
        uiPromises.push(new Promise<void>((resolve) => {
            this.nameDropDown = new DropDown(this.allVariables.map(element => element.name),
                () => {
                    this.nameUI.appendChild(this.nameDropDown.getContainer());
                    this.nameDropDown.setSelectionChangedHandler(this.onScalarChange.bind(this));
                    resolve();
                },
                this.selectedVariable != null ? this.selectedVariable.name : null);
        }));

        this.valueUI = <HTMLDivElement>this.container.querySelector("#value");
        value = value == null ? "" : value;
        uiPromises.push(new Promise<void>((resolve) => {
            this.valueField = new TextInput(value, this.onScalarValueChange.bind(this),
                () => {
                    this.valueUI.appendChild(this.valueField.getContainer());
                    resolve();
                }, this.selectedVariable != null && this.selectedVariable.name ? TextInputState.OK : TextInputState.EDIT);
        }));

        this.removeButton = <HTMLButtonElement>this.container.querySelector("#button");
        this.removeButton.onclick = this.onRemoveClick.bind(this);

        Promise.all(uiPromises).then(() => { this.loadedCallback(this); });
    }

    // The selection in the drop down has changed. This must be reflected upwards.
    private onScalarChange(dropDown: DropDown) {
        let previousValue = this.selectedVariable;
        this.selectedVariable = this.allVariables.find(element => {return dropDown.getSelected() == element.name});
        this.nameChangedCallback(this, previousValue);
    }
    
    private onRemoveClick() {
        this.removeCallback(this);
    }

    private onScalarValueChange(value: string) {
        this.scalarValueChangeCallback(this);
        return true;
    }

    setVariableNameChangedCallback(callback: (variable: Variable, scalar?: Configs.ScalarVariable) => void) {
        this.nameChangedCallback = callback;
    }
    
    setOnScalarValueChangeCallback(callback: (variable: Variable) => void){
        this.scalarValueChangeCallback = callback;
    }

    updateVariableNames(allVariables: Array<Configs.ScalarVariable>) {
        this.allVariables = allVariables;
        this.nameDropDown.updateValues(allVariables.map(element => {
            return element.name;
        }));
    }

    getValue() {
        return this.valueField.getText();
    }

    getVariableName() {
        return this.nameDropDown.getSelected();
    }

    getVariable() {
        return this.selectedVariable;
    }

    getContainer() {
        return this.container;
    }

}