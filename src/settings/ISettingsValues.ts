export interface ISettingsValues {
    //setSetting(key: string, value: any) : void;
    getSetting(key: string): any;
    getValue(key: string): any;
    setValue(key: string, value: any): void;
}