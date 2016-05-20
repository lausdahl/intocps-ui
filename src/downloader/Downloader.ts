import * as childProcess from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as http from "http";
let request = require("request");
let progress = require("request-progress");
let hash = require("md5-promised");
let unzip = require("unzip");





export function getSystemPlatform() {
    let arch: string;
    if (process.arch == "ia32") {
        arch = "32";
    } else if (process.arch == "x64") {
        arch = "64";
    } else {
        throw new Error(`Unsupported architecture ${arch}`);
    }
    let platform: string;
    if (process.platform == "linux") {
        platform = "linux";
    } else if (process.platform == "win32") {
        platform = "windows";
    } else if (process.platform == "darwin") {
        platform = "osx";
    } else {
        throw new Error(`Unsupport platform ${platform}`);
    }
    return platform + arch;
}


const SYSTEM_PLATFORM = getSystemPlatform();


export function fetchVersionList(url:string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        // let data = new Stream<string>();
        request({url: url, json: true}, function (
                error: Error, response: http.IncomingMessage, body: any) {
            if (!error && response.statusCode == 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}


export function fetchVersion(url: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        request({url: url, json: true}, function (
                error: Error, response: http.IncomingMessage, body: any) {
            if (!error && response.statusCode == 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}


export function downloadTool(tool: any, targetDirectory: string, progressCallback: Function) {
    const url: string = tool.platforms[SYSTEM_PLATFORM].url;
    const fileName: string = tool.platforms[SYSTEM_PLATFORM].filename;
    const filePath: string = path.join(targetDirectory, fileName);
    const md5sum: string = tool.platforms[SYSTEM_PLATFORM].md5sum;
    return new Promise<any>((resolve, reject) => {
        progress(request(url))
        .on("progress", function (state: any) {
            progressCallback(state);
        })
        .on("error", function (error: Error) {
            reject(error);
        })
        .on("end", function () {
            progressCallback(1);
            hash(filePath).then(function (newMd5sum: string) {
                if (newMd5sum == md5sum) {
                    resolve(filePath);
                } else {
                    reject("Bad MD5");
                }
            }, function (error: string) {
                reject(error);
            });
        })
        .pipe(fs.createWriteStream(filePath));
    });
}


function launchToolInstaller(filePath: string) {
    return new Promise<string>((resolve, reject) => {
        childProcess.execFile(filePath, function (error: string, stdout: string, stderr: string) {
            if (!error) {
                resolve(stdout);
            } else {
                reject(error)
            }
        });
    });
}


function unpackTool(filePath: string, targetDirectory: string) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
        .on("error", function (error: string) {
            reject(error);
        })
        .on("close", function () {
            resolve();
        })
        .pipe(unzip.Extract({path: targetDirectory}));
    });
}


export function installTool(tool: any, filePath: string, targetDirectory: string) {
    const action = tool.platforms[SYSTEM_PLATFORM].action;
    if (action == "launch") {
        return launchToolInstaller(filePath);
    } else if (action == "unpack") {
        return unpackTool(filePath, targetDirectory);
    } else {
        throw new Error(`Unsupported action: ${action}`);
    }
}



export function compareVersions (a:string, b:string) {
    var i:number, diff:number;
    var regExStrip0 = /(\.0+)+$/;
    var segmentsA = a.replace(regExStrip0, '').split('.');
    var segmentsB = b.replace(regExStrip0, '').split('.');
    var l = Math.min(segmentsA.length, segmentsB.length);

    for (i = 0; i < l; i++) {
        diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
        if (diff) {
            return diff;
        }
    }
    return segmentsA.length - segmentsB.length;
}