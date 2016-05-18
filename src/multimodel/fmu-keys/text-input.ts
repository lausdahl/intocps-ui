export enum TextInputState {
    OK,
    EDIT
}

type editButtonGlyphicons = "glyphicon-ok" | "glyphicon-edit";

export class TextInput {
    container: HTMLDivElement;
    textField: HTMLInputElement;
    editOkButton: HTMLButtonElement;
    editOkButtonGlyphicon: HTMLSpanElement;
    cancelButton: HTMLButtonElement;
    state: TextInputState;
    text: string;
    callback: (text: string) => boolean;
    constructor(container: HTMLDivElement, text: string, callback: (text: string) => boolean, state?: TextInputState) {
        this.container = container;
        this.textField = <HTMLInputElement>this.container.querySelector("#text");
        this.editOkButton = <HTMLButtonElement>this.container.querySelector("#editOkButton");
        this.editOkButton.onclick = this.okEditClicked.bind(this);
        this.editOkButtonGlyphicon = <HTMLSpanElement>this.container.querySelector("#editOkButton-icon");
        this.cancelButton = <HTMLButtonElement>this.container.querySelector("#cancelButton");
        this.cancelButton.onclick = this.cancelClicked.bind(this);
        this.text = text;
        this.callback = callback;
        this.setTextUI(this.text);
        this.setState(state != null ? state : TextInputState.OK);
    }

    private setTextUI(text: string) {
        this.textField.value = text;
    }
    
    private getTextUI(){
        return this.textField.value;
    }

    private setState(state: TextInputState) {
        this.state = state;
        if (state == TextInputState.OK) {
            this.setButtonGlyphicon(this.editOkButtonGlyphicon, "glyphicon-edit", "glyphicon-ok");
            this.textField.readOnly = true;
            this.hideElement(this.cancelButton);
        }
        else if (state == TextInputState.EDIT) {
            this.setButtonGlyphicon(this.editOkButtonGlyphicon, "glyphicon-ok", "glyphicon-edit");
            this.textField.readOnly = false;
            this.showElement(this.cancelButton);
        }
    }

    private hideElement(element: HTMLElement) {
        if (!element.classList.contains("hidden")) {
            element.classList.add("hidden");
        }
    }

    private showElement(element: HTMLElement) {
        if (element.classList.contains("hidden")) {
            element.classList.remove("hidden");
        }
    }

    private setButtonGlyphicon(iconElement: HTMLElement, classToAdd: editButtonGlyphicons, classToRemove: editButtonGlyphicons) {
        if (iconElement.classList.contains(classToRemove)) {
            iconElement.classList.remove(classToRemove);
        }
        if (!iconElement.classList.contains(classToAdd))
        { iconElement.classList.add(classToAdd); }
    }
    private okEditClicked(event: MouseEvent) {
        if(this.state == TextInputState.OK)
        {
            this.setState(TextInputState.EDIT);
        }
        else if(this.state == TextInputState.EDIT)
        {
            if(this.callback(this.getTextUI()))
            {
                this.text = this.getTextUI();
            }
            else{
                alert("The key already exists");
            }
        }
    }
    
    private cancelClicked(event: MouseEvent) {
        this.setTextUI(this.text);
        this.setState(TextInputState.OK);
     }


}