/// <reference path="../../typings/browser/ambient/github-electron/index.d.ts"/>
/// <reference path="../../typings/browser/ambient/node/index.d.ts"/>

// Module contaiing valid setting keys
export namespace SettingKeys {
    export var ACTIVE_PROJECT = "active_project";
    export var INSTALL_DIR = "install_dir";
    export var INSTALL_TMP_DIR = "install_tmp_dir";
    export var COE_URL = "coe_host_url";
    export var COE_DEBUG_ENABLED = "coe_debug_enabled";
    export var COE_REMOTE_HOST = "coe_remote_host";
    export var RTTESTER_INSTALL_DIR: string = "rttester_install_dir";
    export var RTTESTER_MBT_INSTALL_DIR: string = "rttester_mbt_install_dir";
    export var RTTESTER_PYTHON: string = "rttester_python_executable";
    export var UPDATE_SITE = "update_site";

    export var DEFAULT_VALUES: { [key: string]: any; } = {};
    DEFAULT_VALUES[RTTESTER_INSTALL_DIR] = 'C:/opt/rt-tester';
    DEFAULT_VALUES[RTTESTER_MBT_INSTALL_DIR] = "C:/opt/rtt-mbt";
    DEFAULT_VALUES[RTTESTER_PYTHON] = "C:/Python27/python.exe";
    DEFAULT_VALUES[UPDATE_SITE] = "https://raw.githubusercontent.com/into-cps/release-site/development/download/"
}
