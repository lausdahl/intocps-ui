export class Output {
    private listElement: HTMLLinkElement;
    private name: string;
    private selected: boolean = false;

    constructor(listElement: HTMLLinkElement, name: string, selected: (output: Output) => void) {
        this.listElement = listElement;
        this.name = name;
        this.listElement.innerText = this.name;
        this.listElement.addEventListener("click", () => {
            if (!this.selected) {
                this.listElement.classList.add("active");
                selected(this);
                this.selected = true;
            }
        });
    }
    deselect() {
        this.listElement.classList.remove("active");
        this.selected = false;
    }
    
    getName(): string {
        return this.name;
    }
}