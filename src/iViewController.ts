import {SourceDom} from "./sourceDom"
export abstract class IViewController {
    constructor(protected viewDiv: HTMLDivElement) {};
    abstract initialize(sourceDom: SourceDom) : void;
}