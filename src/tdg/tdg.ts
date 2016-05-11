// Probably needed

import {IntoCpsApp} from "../IntoCpsApp"
import {SourceDom} from "../sourcedom"

export class TdgController {

    div:HTMLDivElement;

    public initialize() {
        IntoCpsApp.setTopName("Test Data Generation");
    }

    constructor(div:HTMLDivElement){
      this.div=div
    }

    public load(source:SourceDom){
      // process configuration source here
      // as a first step, we recommend extracting the JSON data into a
      // type-safe map
    }


}

