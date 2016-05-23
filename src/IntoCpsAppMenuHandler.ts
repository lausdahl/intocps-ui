export class IntoCpsAppMenuHandler {
    openCoeView: (path: string) => void;
    openMultiModel: (path: string) => void;
    openSysMlExport: (path: string) => void;
    openFmu: (path: string) => void;
    openDseView: (path: string) => void;
    
    deInitialize: () => boolean;
    
    createDse: (path: string) => void;
    createMultiModel: (path: string) => void;
    createCoSimConfiguration: (path: string) => void;
    createRTTesterProject: (path: string) => void;
}
