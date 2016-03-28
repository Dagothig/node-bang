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
		{ stdio: ['pipe', process.stdout, process.stderr] }
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
		rename = require('gulp-rename'),
		babel = require('gulp-babel'),
		uglify = require('gulp-uglify');

	var val = gulp.src('./client.js')
		.pipe(plumber({ errorHandler: errorHandler('client') }))
		.pipe(browserify())
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(uglify())
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
		"./client/**/*.js"
	], ['client']);
});

gulp.task('public', function() {
	log('Public files changed');
	if (node) node.stdin.write('reload\n');
});

gulp.task('watch-public', function(cb) {
	log("Watching public files...");
	return gulp.watch([
		"./public/**",
		"./pages/**"
	], ['public']);
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

gulp.task('default', [
	'server', 'client',
	'watch-server', 'watch-client', 'watch-public'
]);

process.on("exit", function() {
	if (node) node.kill();
});