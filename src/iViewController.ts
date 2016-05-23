import {SourceDom} from "./sourceDom";

export interface IViewController {
    initialize?(sourceDom: SourceDom): void;
}

export abstract class IViewController {
    constructor(protected viewDiv: HTMLDivElement) {};
}
