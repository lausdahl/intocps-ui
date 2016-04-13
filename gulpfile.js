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
    debug = require('gulp-debug');

// Tasks

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
gulp.task('build', ['lint-ts', 'compile-ts', 'copy-js', 'copy-html', 'copy-css', 'copy-bower', 'copy-fonts']);

// Default task 
gulp.task('default', ['build']);
