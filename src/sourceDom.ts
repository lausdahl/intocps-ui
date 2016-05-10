export class SourceDom {
    private path: string;
    data: any

    constructor(path: string) {
        this.path = path;
        this.data = this.load(path);
    }

    public save(): void {
        //TODO: Implement save functionality
    }

    public discard(): void {
        this.data = this.load(this.getPath());
    }

    private load(path: string) : any {
        let fs = require('fs');
        try {
            if (fs.accessSync(path, fs.R_OK)) {
                return;
            }
            return fs.readFileSync(path, "utf8");
        }
        catch (e) { console.log("An error occured when loading the file: " + path);}
    }

    public getPath(): string {
        return this.path;
    }
}