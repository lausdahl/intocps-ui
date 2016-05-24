  var spawn = require('child_process').spawn;
  //  var child = spawn('java -jar /Users/kel/data/into-cps/intocps-ui/test-create/downloads/coe-0.0.4-jar-with-dependencies.jar');
     var child = spawn('java',['-jar', '/Users/kel/data/into-cps/intocps-ui/test-create/downloads/coe-0.0.4-jar-with-dependencies.jar'],{
 // detached: true
});
//child.unref();
   
    child.stdout.on('data', function (data: any) {
        console.log('stdout: ' + data);
        //Here is where the output goes
    });
    child.stderr.on('data', function (data: any) {
        console.log('stderr: ' + data);
        //Here is where the error output goes
    });
    child.on('close', function (code: any) {
        console.log('closing code: ' + code);
        //Here you can get the exit code of the script
    });
    