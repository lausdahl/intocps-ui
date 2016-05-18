import {OutputElement} from "./outputElement.ts"
import * as Configs from "../../intocps-configurations/intocps-configurations";

export class ConnectionsInstanceElement<T> extends OutputElement {
    instance: T;
    constructor(listElement: HTMLLinkElement, name: string, selected: (output: OutputElement) => void, instance: T)
    {
        super(listElement, name, selected);
        this.instance = instance;
    }
    
    getInstance(){
        return this.instance;
    }
}