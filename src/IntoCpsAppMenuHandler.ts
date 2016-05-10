
import {CoeController} from "./coe/coe";

export class IntoCpsAppMenuHandler {
    openCoeView: (path: string) => void;
    openMultiModel: (path: string) => void;
    openSysMlExport: (path: string) => void;
    openFmu: (path: string) => void;

    createMultiModel: (path: string) => void;
    createCoSimConfiguration: (path: string) => void;
}