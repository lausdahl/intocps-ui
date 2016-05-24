import {ListElement} from "./list-element"
import * as Configs from "../../intocps-configurations/intocps-configurations";

export class InstanceListElement<T> extends ListElement {
    instance: T;
    constructor(listElement: HTMLLinkElement, name: string, selected: (output: ListElement) => void, instance: T)
    {
        super(listElement, name, selected);
        this.instance = instance;
    }
    
    getInstance(){
        return this.instance;
    }
}