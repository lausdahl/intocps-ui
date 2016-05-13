
import {SourceDom} from "../sourceDom";
import {IViewController} from "../iViewController";

export class CreateRTTesterProjectController extends IViewController {

    constructor(protected viewDiv: HTMLDivElement) {
        super(viewDiv);
    };

    initialize(sourceDom: SourceDom): void {
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

    createProject() {
        document.getElementById("CreationParameters").style.display = 'none';
        document.getElementById("OutputText").style.display = "visible";

        var hPath: HTMLInputElement = <HTMLInputElement>document.getElementById("XMIModelPathText");
        var PythonShell = require('python-shell');
        var options = {
            mode: "text",
            // TODO: Fix path
            // scriptPath: "...",
            args: ["-h"]
        };
        PythonShell.run("rtt-mbt-create-fmi2-project.py", options, function (err: any, results: any) {
            if (err) throw err;
            var hOutput: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("OutputText");
            var text: string = results.join("\n"); 
            hOutput.textContent = text;
            console.log('results: ' + text);
        });
    }

}

