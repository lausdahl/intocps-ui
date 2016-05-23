// ITC Marking: Export Controlled - Created at UTRC-I, ECCN NLR
// Copyright UTRC 2016

import {IProject} from "./IProject"

// Basic container. Holds stuff that we just want to open: models, FMUs, results...
export class Container {

    filepath:string;
    type:ContainerType;
    name:string;

    constructor(name:string,path_:string,type_:ContainerType){
      this.filepath=path_;
      this.type=type_;
      this.name = name;
    }

    public getFilePath(){
      return this.filepath;
    }

    public getType(){
      return this.type;
    }
    
    

};

export enum ContainerType {SysML,VDM,Modelica,TSim,FMU,Result, Folder,CoeConfig,MultiModelConfig,SysMLExport,EMX,MO,CSV};
