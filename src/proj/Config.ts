// ITC Marking: UTC Proprietary - Export Controlled - Created at UTRC-I, ECCN NLR
// Copyright UTRC 2016

import fs = require('fs');

export class Config {

    filePath:string;
    configs:  { [key:string]:string };

    constructor(path_:string, jsonstring:string){
      this.filePath=path_;
      this.configs=JSON.parse(jsonstring);
    }

    public getfilePath(){
      return this.filePath;
    }

    public getConfig(key:string){
      return this.configs[key];
    }

    public setConfig(key:string, value:string){
      this.configs[key]=value;
    }

    public save(){
        fs.writeFile(this.filePath, JSON.stringify(this.configs), (err) => {
            if (err) {
                console.log("Failed to write: " + this.filePath + ".");
            }
            else {
                console.log("File saved in : " + this.filePath + ".");
            }
            });
    }

}
