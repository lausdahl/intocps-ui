export interface ISettingsValues{
    setSetting(key: string, value: any) : void;
    getSetting(key: string) : any;
}