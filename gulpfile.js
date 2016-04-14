// ITC Marking: UTC Proprietary - Export Controlled - Created at UTRC-I, ECCN NLR
// Copyright UTRC 2016

'use strict';

// Locations 
var outputPath = 'dist/',
    htmlSrcs = 'src/**/*.html',
    jsSrcs = 'src/**/*.js',
    lintTsSrcs = ['src/**/*.ts'],
    tsSrcs = ['src/**/*.ts', 'typings/browser/**/*.ts'],
    cssSrcs = 'bower_components/bootstrap/dist/css/bootstrap.css';

// Tools.
var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    sourcemap = require('gulp-sourcemaps'),
    tsProject = ts.createProject('tsconfig.json'),
    lint = require('gulp-tslint'),
    del = require('del'),
    mainBowerFiles = require('main-bower-files'),
    bowerFilter = require('gulp-filter'),
    debug = require('gulp-debug'),
	childProcess = require('child_process');
    typings = require('gulp-typings'),

// Tasks

// Download an initialize typings and bower
// Spawn does not work well on windows, because it cannot run cmd files, which npm is. https://github.com/nodejs/node-v0.x-archive/issues/2318
gulp.task("init", function(cb){
	var reportFunc = function(error, stdout, stderr, prefix, func){
		console.log(prefix + ` - stdout: ${stdout}`);
		if(stderr !== null && /\S/.test(stderr)){
				console.log(prefix + ` - stderr: [${stderr}]`);
		}
		
		if (error !== null) {
		  console.log(prefix + ` - error: ${error}`);
		}
		else{
			if(func != null)
			{
				func();
			}		
		}		
	}
	
	var typingsInstallFunc = function(){
		childProcess.exec('typings install', (error, stdout, stderr) => {reportFunc(error, stdout, stderr,'typings install');
		});
	}
	var bowerInstallFunc = function(){
		childProcess.exec('bower install', (error, stdout, stderr) => {reportFunc(error, stdout, stderr, 'bower install');
		});
	}
	
	childProcess.exec('npm install -g typings',  (error, stdout, stderr) => {
		reportFunc(error, stdout, stderr, "npm install typings", typingsInstallFunc);
	});
	
	childProcess.exec('npm install -g bower',  (error, stdout, stderr) => {
		reportFunc(error, stdout, stderr, "npm install bower", bowerInstallFunc);
	});
// Install typings
gulp.task("install-ts-defs",function(){
    gulp.src("./typings.json")
        .pipe(typings()); 
});
});

// Clean everything!
gulp.task("clean", function() {
    return del([outputPath]);
});

// Lint TS (check for rule violations)
gulp.task("lint-ts", function() {
    return gulp.src(lintTsSrcs).pipe(lint()).pipe(lint.report('prose', { emitError: false }));
});

// Compile TS->JS with sourcemaps 
gulp.task("compile-ts", function() {
    var tsResult = gulp.src(tsSrcs)
        .pipe(sourcemap.init())
        .pipe(ts(tsProject));

    tsResult.dts.pipe(gulp.dest(outputPath));

    return tsResult.js.pipe(sourcemap.write('.'))
        .pipe(gulp.dest(outputPath));
});

// Copy important bower files to destination
gulp.task('copy-bower', function() {
    return gulp.src(mainBowerFiles())
        .pipe(bowerFilter('**/*.js'))
        .pipe(gulp.dest(outputPath + 'bower_components'));
});

// Copy bootstrap fonts to destination
gulp.task('copy-fonts', function() {
    return gulp.src('bower_components/bootstrap/fonts/**/*').pipe(gulp.dest(outputPath + 'fonts'))
});


// Copy css to app folder
gulp.task('copy-css', function() {
    gulp.src(cssSrcs).pipe(gulp.dest(outputPath + 'css'));
});

// Copy html to app folder
gulp.task('copy-html', function() {
    gulp.src(htmlSrcs)
        // process html here if needed
        .pipe(gulp.dest(outputPath));
});

// Copy js to app folder
gulp.task('copy-js', function() {
    gulp.src(jsSrcs)
        // process js here if needed
        .pipe(gulp.dest(outputPath));
});

//Build App
gulp.task('build', ['compile-ts', 'copy-js', 'copy-html', 'copy-css', 'copy-bower', 'copy-fonts']);

// Default task 
gulp.task('default', ['build']);
