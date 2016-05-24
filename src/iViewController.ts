import {SourceDom} from "./sourceDom";

export interface IViewController {
    initialize?(sourceDom: SourceDom): void;
    deInitialize?(): boolean;
}

export abstract class IViewController {
    constructor(protected viewDiv: HTMLDivElement) {};
}
