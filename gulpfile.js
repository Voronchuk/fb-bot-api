'use strict';

var del                 = require('del');
var gulp                = require('gulp');
var sourcemaps          = require('gulp-sourcemaps');
var babel               = require('gulp-babel');
var concat              = require('gulp-concat');
var minimist		    = require('minimist');
var runSequence 	    = require('run-sequence');
var shell               = require('gulp-shell');


var paths = {
	src: 'src/**/*.js',
};


// Clear old scripts
gulp.task('clean', function(cb) {
	// You can use multiple globbing patterns as you would with `gulp.src`
	del(['app'], cb);
});

// Compile ES6 with Babel
gulp.task('src', ['clean'], function () {
    return gulp.src(paths.src)
        //.pipe(sourcemaps.init())
        .pipe(babel())
        //.pipe(concat('all.js'))
        //.pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('app'));
});

// Return the task when a file changes
gulp.task('watch', function() {
	gulp.watch(paths.src, ['src']);
});


// Do full project update
gulp.task('default', function(callback) {
	runSequence(
		'src',
		//'start-telegram',
		callback
	);
});