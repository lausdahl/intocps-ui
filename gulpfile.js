// ITC Marking: UTC Proprietary - Export Controlled - Created at UTRC-I, ECCN NLR
// Copyright UTRC 2016

'use strict';

// Locations 
var outputPath = 'dist/',
    htmlSrcs = 'src/**/*.html',
    jsSrcs = 'src/**/*.js',
    tsSrcs = 'src/**/*.ts';

// Tools.
var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    sourcemap = require('gulp-sourcemaps'),
    tsProject = ts.createProject('tsconfig.json'),
    lint = require('gulp-tslint'),
    del = require('del');

// Tasks

// Clean everything!
gulp.task("clean",function() {
  return del([outputPath]);
});

// Lint TS (check for rule violations)
gulp.task("lint-ts", function() {
   return gulp.src(tsSrcs).pipe(lint()).pipe(lint.report('prose')); 
});

// Compile TS->JS with sourcemaps 
gulp.task("compile-ts", function () {
    var tsResult = gulp.src(tsSrcs)
                        .pipe(sourcemap.init())
                        .pipe(ts(tsProject));
   
    tsResult.dts.pipe(gulp.dest(outputPath));

    return tsResult.js.pipe(sourcemap.write('.'))
                          .pipe(gulp.dest(outputPath));
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
gulp.task('build', ['compile-ts','copy-js','copy-html']);

// Default task 
gulp.task('default', ['build']);
