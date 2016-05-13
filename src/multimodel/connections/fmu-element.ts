import {Fmu} from "../../coe/fmi";

export class FmuElement {
    private listElement: HTMLLinkElement;
    private fmu: Fmu;
    private selected: boolean = false;

    constructor(listElement: HTMLLinkElement, fmu: Fmu, selected: (fmu: FmuElement) => void) {
        this.listElement = listElement;
        this.fmu = fmu;
        this.listElement.innerText = this.fmu.name;
        this.listElement.addEventListener("click", () => {
            if (!this.selected) {
                this.listElement.classList.add("active");
                selected(this);
                this.selected = true;
            }
        });
    }
    
    getFmu(){
        return this.fmu;
    }
    
    deselect() {
        this.listElement.classList.remove("active");
        this.selected = false;
    }

    getHtml() {
        return this.listElement;
    }
}