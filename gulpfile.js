// Build tools
const gulp = require('gulp'),
	livereload = require('gulp-livereload'),
	uglify = require('gulp-uglify'),
	jshint = require('gulp-jshint'),
	babel = require('gulp-babel'),
	shell = require('gulp-shell');

// Compilers
const browserify = require('browserify'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer');

// Package Object
const pkg = require('./package.json');

// Nodemon
const nodemon = require('gulp-nodemon');

// Build JS
gulp.task('js', function() {
	return browserify()
		.transform("babelify", {
			presets: ["es2015", "react"]
		})
		.add(pkg.js.src+pkg.js.file)
		.bundle()
		.pipe(source(pkg.js.file))
		.pipe(buffer())
		// .pipe(uglify())
		.pipe(gulp.dest(pkg.js.dist))
		.pipe(livereload());
});

// Start sass watch
gulp.task('sass', shell.task([
  'sass --watch '+pkg.styles.src+':'+pkg.styles.dest
]));

// Watch assets for live reload
gulp.task('watch', function() {
	gulp.watch(pkg.styles.dest);
	gulp.watch(pkg.js.src+"**/*.*", ['js']);
	livereload.listen();
});

// Tests
gulp.task('lint', function () {
	gulp.src(['./**/*.js', '!/assets/scripts/**/*.*'])
		.pipe(jshint())
})

// Start dev server
gulp.task('dev', function () {
	nodemon({
		script: 'server.js',
        args:['--harmony'],
        nodeArgs: [],
		ext: 'html js',
		ignore: ['assets/**/*'],
		//tasks: ['lint'],
		env: {
			'NODE_ENV': 'development'
		}
	})
	.on('restart', function () {
		console.log('server restarted')
	})
});

// Start prod server
gulp.task('prod', function () {
	nodemon({
		script: 'server.js',
        args:['--harmony'],
        nodeArgs: [],
		ext: 'html js',
		ignore: ['assets/**/*'],
		env: {
			'NODE_ENV': 'production'
		}
	})
});

gulp.task('default', ['watch', 'sass', 'dev']);