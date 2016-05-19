import {ListElement} from "./list-element"
import {InstanceListElement} from "./connections-instance-element"
import * as Configs from "../../intocps-configurations/intocps-configurations";

export class CheckboxInstanceListElement<T> extends InstanceListElement<T> {
    private checkBoxId = "input-checkbox";
    private checkBox: HTMLInputElement;
    instance: T;
    constructor(listElement: HTMLLinkElement, name: string, selected: (output: ListElement) => void, instance: T) {
        super(listElement, name, selected, instance);
        this.checkBox = <HTMLInputElement>this.listElement.querySelector("#" + this.checkBoxId);
        // The checkbox does not need an onclick handler, because one is already available on the entire list element.
        // this.checkBox.onclick = this.select.bind(this);
    }

    getChecked(): boolean {
        return this.checkBox.checked;
    }

    setCheckboxState(state: boolean) {
        this.checkBox.checked = state;
    }

    protected select(event: JQueryEventObject) {
        //If the event comes from the checkbox, then the state of the checkbox will already have been updated.
        //However if the ID is not from the checkbox, then the state of the checkbox has to be updated manually.
        if (event.target.id !== this.checkBoxId) {
            this.setCheckboxState(!this.getChecked());
        }
        this.selectedCB(this);
    }

    deselect() {
        this.setCheckboxState(false);
    }
}