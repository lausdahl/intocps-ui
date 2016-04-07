'use strict';

// Locations 
var outputPath = 'dist/',
    htmlSrcs = 'src/**/*.html',
    tsSrcs = 'src/**/*.ts';

// Tools.
var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    sourcemap = require('gulp-sourcemaps'),
    tsProject = ts.createProject('tsconfig.json'),

// Tasks
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

// Default task 
gulp.task('default', function() { });
