import * as Main from  "../main/Settings.ts"
import * as IntoCpsApp from  "../main/IntoCpsApp.ts"
import {SettingKeys} from "../main/SettingKeys";


let remote = require("remote");

let app: IntoCpsApp.IntoCpsApp = remote.getGlobal("intoCpsApp");

var element = <HTMLElement>document.getElementById("settings-div");

element.innerHTML="<p>Install Dir: "+ app.getSettings().getSetting(SettingKeys.INSTALL_DIR) + "</p>"+"<p>Install Tmp Dir: "+ app.getSettings().getSetting(SettingKeys.INSTALL_TMP_DIR) + "</p>";


function save() {

}