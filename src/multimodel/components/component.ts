export class Component {
    private static hidden: string = "hidden";
    static hide(element: HTMLElement) {
        if (!element.classList.contains(this.hidden)) {
            element.classList.add(this.hidden);
        }
    }

    static show(element: HTMLElement) {
        if (element.classList.contains(this.hidden)) {
            element.classList.remove(this.hidden);
        }
    }



}