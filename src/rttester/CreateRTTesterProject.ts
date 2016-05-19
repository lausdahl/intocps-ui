
import {SourceDom} from "../sourceDom";
import {IViewController} from "../iViewController";
import {IntoCpsApp} from "../IntoCpsApp"
import * as Settings from  "../settings/settings"
import {SettingKeys} from "../settings/SettingKeys";
import Path = require('path');


export class CreateRTTesterProjectController extends IViewController {

    constructor(protected viewDiv: HTMLDivElement) {
        super(viewDiv);
    };

    initialize(sourceDom: SourceDom): void {
        IntoCpsApp.setTopName("RT-Tester Project");
    }

    xmiModelBrowser() {
        let remote = require("remote");
        let dialog = remote.require("dialog");
        let dialogResult: string[] = dialog.showOpenDialog({
            filters: [{ name: 'XMI-Files', extensions: ['xmi', 'xml'] }]
        });
        if (dialogResult != undefined) {
            var hText: HTMLInputElement = <HTMLInputElement>document.getElementById("XMIModelPathText");
            hText.value = dialogResult[0];
        }
    }

    createProject(): void {
        document.getElementById("CreationParameters").style.display = 'none';
        document.getElementById("Output").style.display = "block";
        var hPath: HTMLInputElement = <HTMLInputElement>document.getElementById("XMIModelPathText");
        var hOutputText: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("OutputText");
        let app: IntoCpsApp = IntoCpsApp.getInstance();
        let settings = app.getSettings();
        let script = Path.normalize(settings.getSetting(SettingKeys.RTTESTER_MBT_INSTALL_DIR));
        script = Path.join(script, "bin/rtt-mbt-create-fmi2-project.py");

        const spawn = require('child_process').spawn;
        var pythonPath = Path.normalize(settings.getSetting(SettingKeys.RTTESTER_PYTHON));
        const process = spawn(pythonPath, [script, "--skip-rttui", hPath.value]);
        process.stdout.on('data', (data: string) => {
            hOutputText.textContent += data + "\n";
            hOutputText.scrollTop = hOutputText.scrollHeight;
        });
        process.stderr.on('data', (data: string) => {
            hOutputText.textContent += data + "\n";
            hOutputText.scrollTop = hOutputText.scrollHeight;
        });
        process.on('close', (code: number) => {
            document.getElementById("scriptRUN").style.display = "none";
            document.getElementById(code == 0 ? "scriptOK" : "scriptFAIL").style.display = "block";
        });
    }

}

