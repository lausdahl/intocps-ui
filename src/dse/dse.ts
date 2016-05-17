import {IntoCpsApp} from "../IntoCpsApp"
import {SourceDom} from "../sourceDom"
import {IViewController} from "../iViewController"

export class DseController extends IViewController {

    public initialize() {
        IntoCpsApp.setTopName("Design Stace Exploration");
    }

    constructor(div:HTMLDivElement){
      super(div);
    }

    public load(source:SourceDom){
      // process configuration source here
      // as a first step, we recommend extracting the JSON data into a
      // type-safe map
    }

}
