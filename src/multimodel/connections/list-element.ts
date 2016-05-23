export class ListElement {
    protected listElement: HTMLLinkElement;
    private textElement: HTMLSpanElement;
    private name: string;
    protected selected: boolean = false;
    protected selectedCB: (output: ListElement) => void;

    constructor(listElement: HTMLLinkElement, name: string, selected: (output: ListElement) => void) {
        this.listElement = listElement;
        this.textElement = <HTMLSpanElement>this.listElement.querySelector("#input-text")
        this.name = name;
        this.selectedCB = selected;
        this.textElement.innerText = this.name;
        this.listElement.addEventListener("click", this.select.bind(this));
    }

    protected select(event: JQueryEventObject) {
        if (!this.selected) {
            this.listElement.classList.add("active");
            this.selectedCB(this);
            this.selected = true;
        }
    }

    deselect() {
        this.listElement.classList.remove("active");
        this.selected = false;
    }   

    getName(): string {
        return this.name;
    }

    getHtml(): HTMLLinkElement {
        return this.listElement;
    }

}