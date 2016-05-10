class SourceModel{
    private path: string;
    data: any
    
    constructor(path: string, data: any){
        this.path = path;
        this.data = data;
    }
   
    public save() : void {
        //TODO: Implement save functionality
    }    
    
    public discard(): void {
        //Todo: Implement discard functionality. (Basically do nothing? and reload the data?)
    }
    
    public getPath() : string{
        return this.path;
    }
}