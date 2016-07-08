var gulp = require('gulp');
var exec = require('child_process').exec;
var postcss = require('postcss');
const fs = require('fs');
const del = require('del');

//////////

// Build steps
// - complete `clear-build` task
// - run `dev-tasks` or `production-tasks`

//////////

gulp.task('clear-build', ['delete-build'], function(cb) {
	fs.mkdir('./dist', function(exception) {
		cb(exception);
	});
});

gulp.task('dev-tasks', ['move-html', 'move-bandjs', 'build-css', 'build-js']);
gulp.task('production-tasks', ['move-html', 'move-bandjs', 'build-css', 'build-js-production']);

//////////

gulp.task('delete-build', function() {
	return del(['./dist']);
});

gulp.task('move-html', function() {
	var stream = gulp.src(['./src/index.html'])
		.pipe(gulp.dest('./dist'));

	return stream;
});

gulp.task('move-bandjs', function() {
	var stream = gulp.src(['./src/scripts/band.js'])
		.pipe(gulp.dest('./dist/scripts'));

	return stream;
});

gulp.task('build-css', function() {
	return new Promise(function(resolve, reject) {
			fs.readFile('./src/styles/style.css', 'utf-8', function(err, css) {
				if (err) reject(err);

				resolve(css);
			});
		})
		.then(function(css) {
			var processor = postcss([
				require('postcss-advanced-variables'),
				require('cssnano')
			]);

			return processor.process(css);
		})
		.then(function(result) {
			return new Promise(function(resolve, reject) {
				fs.mkdir('./dist/styles', function(exception) {
					if (exception) reject(exception);

					resolve(result);
				});
			});
		})
		.then(function(result) {
			return new Promise(function(resolve, reject) {
				fs.writeFile('./dist/styles/style.css', result.css, function(err) {
					if (err) reject(err);

					resolve();
				});
			});
		});
});

// webpack is run on the command line because of the nice output it gives there,
//  as opposed to the possible output from running webpack from JavaScript.
gulp.task('build-js', function (cb) {
	exec('webpack', function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
});

gulp.task('build-js-production', function (cb) {
	exec('webpack -p', function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
});
