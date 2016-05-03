// ITC Marking: UTC Proprietary - Export Controlled - Created at UTRC-I, ECCN NLR
// Copyright UTRC 2016

import fs = require('fs');
import {Config} from "./Config.ts"

//Configuration container. Provides additional information
export class ConMap {

    filePath:string;
    connections:Array<{output:string,input:string}>;

    constructor(filePath:string,connections:Array<{output:string,input:string}>){
        this.filePath=filePath;
        this.connections=connections;
    }

    public getFilePath(){
        return this.filePath
    }

    public getConnections(){
        return this.connections;    
    }

    public save(){
        fs.writeFile(this.filePath, JSON.stringify(this.connections), (err) => {
            if (err) {
                console.log("Failed to write: " + this.filePath + ".");
            }
            else {
                console.log("File saved in : " + this.filePath + ".");
            }
        });
    }
}

    
