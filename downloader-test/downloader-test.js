#!/usr/bin/env node

console = require("console");
downloader = require("../dist/downloader/Downloader");

const VERSIONS_URL = "http://overture.au.dk/into-cps/site/download/versions.json";
function progress(state) {
  console.log(parseInt(state.percentage * 100, 10) + "%");
}


function testDownloadAndUnpack() {
  var tool;
  console.log("Fetching list of available version")
  return downloader.fetchVersionList(VERSIONS_URL)
  .then(function (data) {
    console.log(JSON.stringify(data) + "\n");
    console.log("Fetching version 0.0.6");
    return downloader.fetchVersion(data["0.0.6"]);
  })
  .then(function(data) {
    console.log(JSON.stringify(data) + "\n");
    console.log("Downloading tool: Overture Tool Wrapper");
    tool = data.tools.overtureToolWrapper;
    return downloader.downloadTool(tool, ".", progress);
  }).then(function (filePath) {
    console.log("Download complete: " + filePath);
    console.log("Unpacking tool");
    return downloader.installTool(tool, filePath, "installed");
  })
  .then(function () {
    console.log("Installation complete\n");
    return;
  }, function (error) {
    console.log(error);
  });
}

function testInstallerLaunch() {
  var dummyTool = {
    platforms: {
      linux64: {
        action: "launch"
      }
    }
  };

  console.log("Running dummy tool installer");
  downloader.installTool(dummyTool, "./dummy_installer.sh", ".")
  .then(function (stdout) {
    console.log("Dummy tool installer stdout:");
    console.log(stdout + "\n");
    console.log("Dummy tool installation successful");
  }, function (error) {
    console.log(error);
  });
}

testDownloadAndUnpack()
.then(testInstallerLaunch);
