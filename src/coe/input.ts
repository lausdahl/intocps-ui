export class Input{
    private listElement: HTMLLinkElement; 
    private name: string;
    private checkBox : HTMLInputElement; 
    private text : HTMLSpanElement;
    constructor(listElement: HTMLLinkElement, name: string, checked: boolean, changed: (input: Input) => void) {
        this.listElement = listElement;
        this.name = name;
        this.text = <HTMLSpanElement>this.listElement.querySelector("#input-text");
        this.text.innerText = this.name;
        this.checkBox = <HTMLInputElement>this.listElement.querySelector("#input-checkbox");
        this.checkBox.checked = checked;
        this.checkBox.onchange = (ev: Event) => {
            changed(this);
        };
    }
    
    getName() : string {
        return this.name;
    }
    
    getChecked(): boolean {
        return this.checkBox.checked;
    }
}