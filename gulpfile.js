var misc = require('./shared/misc'),
	gulp = require('gulp'),
	childProcess = require('child_process'),
	chalk = require('chalk'),
	source = require('vinyl-source-stream'),
	browserify = require('gulp-browserify'),
	rename = require('gulp-rename'),
	plumber = require('gulp-plumber'),
	sloc = require('gulp-sloc');

var node;

function errorHandler(prefix) {
	return function (e) {
		log(e.message);
		this.emit("end");
	};
}

function log() {
	var prepended = Array.from(arguments);
	prepended.unshift(chalk.gray(misc.simpleTime()) + ' [' + chalk.cyan('gulp')  + ']');
	console.log.apply(this, prepended);
}

gulp.task('server', function() {
	if (node) {
		node.kill();
		log('Server killed');
	}
	node = childProcess.spawn(
		'node',
		['server.js'],
		{ stdio: 'inherit' }
	);
	log('Server started');
});

gulp.task('watch-server', function(cb) {
	log("Watching server files...");
	return gulp.watch([
		"./server.js",
		"./global.js",
		"./shared/**/*.js",
		"./server/**/*.js"
	], ['server']);
});

gulp.task('client', function(cb) {
	var val = gulp.src('./client.js')
		.pipe(plumber({ errorHandler: errorHandler('client') }))
		.pipe(browserify())
		.pipe(rename('app.js'))
		.pipe(gulp.dest('./public'));

	val.on('data', () => log("Client script bundled"));
	return val;
});

gulp.task('watch-client', function(cb) {
	log("Watching client files...");
	return gulp.watch([
		"./client.js",
		"./shared/**/*.js",
		"./client/**/*.js",
	], ['client']);
});

gulp.task('sloc', function(cb) {
	gulp.src([
		'./server.js',
		'./client.js',
		'./shared/**/*.js',
		'./server/**/*.js',
		'./client/**/*.js',
		'./public/**/*.html'
	]).pipe(sloc());
});

gulp.task('default', ['server', 'watch-server', 'client', 'watch-client']);

process.on("exit", function() {
	if (node) node.kill();
});
