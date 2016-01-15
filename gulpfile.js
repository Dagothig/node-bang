var misc = require('./shared/misc'),
	chalk = require('chalk'),
	gulp = require('gulp');

var node;

function log() {
	var prepended = Array.from(arguments);
	prepended.unshift(chalk.gray(misc.simpleTime()) + ' [' + chalk.cyan('gulp')  + ']');
	console.log.apply(this, prepended);
}

function errorHandler(prefix) {
	return function (e) {
		log(e.message);
		this.emit("end");
	};
}

gulp.task('server', function() {
	if (node) {
		node.kill();
		log('Server killed');
	}

	log('Starting server...');

	var childProcess = require('child_process');
	node = childProcess.spawn(
		'node',
		['server.js'],
		{ stdio: 'inherit' }
	);
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
	log('Bundling client script...');
	var plumber = require('gulp-plumber'),
		browserify = require('gulp-browserify'),
		rename = require('gulp-rename');

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
	]).pipe(require('gulp-sloc')());
});

gulp.task('default', ['server', 'client', 'watch-server', 'watch-client']);

process.on("exit", function() {
	if (node) node.kill();
});