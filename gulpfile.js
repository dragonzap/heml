'use strict';
// Inspired by https://github.com/babel/minify/blob/master/gulpfile.babel.js

const del = require('del');
const through = require('through2');
const newer = require('gulp-newer');
const babel = require('gulp-babel');
const util = require('gulp-util');
const plumber = require('gulp-plumber');
const gulp = require('gulp');
const path = require('path');
const { cyan } = util.colors;

const scripts = './packages/*/src/**/*.js';
const builds = './packages/*/build';
const dest = 'packages';

let srcEx, libFragment;

if (path.win32 === path) {
	srcEx = /(packages\\[^\\]+)\\src\\/;
	libFragment = '$1\\build\\';
} else {
	srcEx = new RegExp('(packages/[^/]+)/src/');
	libFragment = '$1/build/';
}

function build(done) {
	return gulp
		.src(scripts)
		.pipe(plumber())
		.pipe(
			through.obj((file, enc, callback) => {
				file._path = file.path;
				file.path = file.path.replace(srcEx, libFragment);
				callback(null, file);
			}),
		)
		.pipe(newer(dest))
		.pipe(babel({ presets: ['@babel/preset-env'], plugins: ['@babel/plugin-transform-async-to-generator', '@babel/plugin-transform-react-jsx', '@babel/plugin-transform-runtime'] }))
		.pipe(gulp.dest(dest))
		.on('end', () => {
			util.log(`Finished '${cyan('build')}'`);
			done();
		});
}

gulp.task('build', (done) => {
	return build(done);
});

gulp.task(
	'watch',
	gulp.series('build', (done) => {
		gulp.watch(scripts, { debounceDelay: 200 }, gulp.series('build'));

		done();
	}),
);

gulp.task('clean', (done) => {
	del.sync(builds);

	return done();
});
