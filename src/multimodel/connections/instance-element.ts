import {Instance} from "../../coe/fmi";

export class InstanceElement {
    private element: HTMLDivElement;
    private txt: HTMLInputElement
    private but1: HTMLButtonElement;
    private but1Span: HTMLSpanElement;
    private removeButton: HTMLButtonElement;
    private instance: Instance;
    private editGlyphicon: glyphiconEditButton = "glyphicon-edit";
    private okGlyphicon: glyphiconEditButton = "glyphicon-ok"
    private addInstanceHandler: (instanceElement: InstanceElement, text: string) => Boolean;
    private editExisting: boolean = false;

    private removeHandler: (instanceElement: InstanceElement) => void;
    private delete: boolean = false;
    constructor(element: HTMLDivElement, instance: Instance, removeHandler: (instanceElement: InstanceElement) => void, addHandler: (instanceElement: InstanceElement, text: string) => Boolean, newInstance?: boolean) {
        this.element = element
        this.instance = instance;
        this.removeHandler = removeHandler;
        this.addInstanceHandler = addHandler;

        this.txt = <HTMLInputElement>this.element.querySelector("#fmu-instance-name");
        this.txt.value = this.instance.name;

        this.but1 = <HTMLButtonElement>this.element.querySelector("#fmu-instance-but1");
        this.but1Span = <HTMLButtonElement>this.but1.querySelector("#fmu-instance-but1-span");
        this.removeButton = <HTMLButtonElement>this.element.querySelector("#fmu-instance-remove-but");

        this.removeButton.onclick = () => {
            this.removeCancelHandler();
        };

        if (newInstance != null && newInstance) {
            this.setButtonToEditState();
            this.delete = true; //Special behavior for first time. Deletes instead of cancelling        
        }
        else {
            this.setButtonToOkState();
        }

    }
    // When in Ok state, set button to edit
    private setButtonToOkState(): void {
        this.delete = true;
        this.setButton(this.okGlyphicon, this.editGlyphicon, true, this.setButtonToEditState);
    }

    //When OK is clicked, then check if it can be added or not.
    private okClickHandler(): void {
        if (this.addInstanceHandler(this, this.txt.value)) {
            this.instance.name = this.txt.value;
            this.setButtonToOkState();
        }
        else {
            alert("Instance already exists");
        }
    }

    private removeCancelHandler() {
        if (!this.delete) {
            this.txt.value = this.instance.name;
            this.setButtonToOkState();
        }
        else {
            this.removeHandler(this);
        }
    }

    // When in Edit state, set button to ok
    private setButtonToEditState(): void {
        this.delete = false;
        this.setButton(this.editGlyphicon, this.okGlyphicon, false, this.okClickHandler);
    }

    private setButton(classToRemove: glyphiconEditButton, classToAdd: glyphiconEditButton, readOnly: boolean, clickHandler: () => void) {
        if (this.but1Span.classList.contains(classToRemove)) {
            this.but1Span.classList.remove(classToRemove);
        }

        classToAdd.split(' ').forEach((element: string) => {
            this.but1Span.classList.add(element);
        });
        this.but1.onclick = clickHandler.bind(this);
        this.txt.readOnly = readOnly;
    }

    getHtml() {
        return this.element;
    }

    getInstance(): Instance {
        return this.instance;
    }
}