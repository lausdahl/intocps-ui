
import {SourceDom} from "../sourceDom";
import {IViewController} from "../iViewController";
import {IntoCpsApp} from "../IntoCpsApp"
import * as Settings from  "../settings/settings"
import {SettingKeys} from "../settings/SettingKeys";
import Path = require('path');


export class CreateRTTesterProjectController extends IViewController {

    directory: string;

    constructor(protected viewDiv: HTMLDivElement, directory: string) {
        super(viewDiv);
        this.directory = directory;
        IntoCpsApp.setTopName("RT-Tester Project");
    };



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
        let projectName = (<HTMLInputElement>document.getElementById("ProjectName")).value;
        let app: IntoCpsApp = IntoCpsApp.getInstance();
        let settings = app.getSettings();
        let script = Path.normalize(settings.getSetting(SettingKeys.RTTESTER_MBT_INSTALL_DIR));
        script = Path.join(script, "bin/rtt-mbt-create-fmi2-project.py");
        let targetDir = Path.normalize(Path.join(this.directory, projectName));

        const spawn = require('child_process').spawn;
        var pythonPath = Path.normalize(settings.getSetting(SettingKeys.RTTESTER_PYTHON));
        let args: string[] = [
            script,
            "--dir=" + targetDir,
            "--skip-rttui",
            hPath.value
        ];
        const process = spawn(pythonPath, args);
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

