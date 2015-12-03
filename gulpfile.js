var gulp = require('gulp'),
    childProcess = require('child_process'),
    chalk = require('chalk'),
    source = require('vinyl-source-stream'),
    browserify = require('gulp-browserify'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber');

var node,
    chalkColor = chalk.cyan,
    prefix = '[' + chalkColor('gulp') + ']';

function errorHandler(prefix) {
    return function (e) {
        console.log(prefix, e.message);
        this.emit("end");
    };
}

gulp.task('server', function() {
    if (node) {
        node.kill();
        console.log(prefix, 'Server killed');
    }
    node = childProcess.spawn(
        'node',
        ['server.js'],
        { stdio: 'inherit' }
    );
    console.log(prefix, 'Server started');
});

gulp.task('watch-server', function(cb) {
    console.log(prefix, "Watching server files...");
    return gulp.watch([
            "./server.js",
            "./shared/*.js",
            "./server/*.js"
        ],
        ['server']
    );
});

gulp.task('client', function(cb) {
    var val = gulp.src('./client.js')
        .pipe(plumber({ errorHandler: errorHandler(prefix) }))
        .pipe(browserify())
        .pipe(rename('app.js'))
        .pipe(gulp.dest('./public'));

    val.on('data', () => console.log(prefix, "Client script bundled"));
    return val;
});

gulp.task('watch-client', function(cb) {
    console.log(prefix, "Watching client files...");
    return gulp.watch([
            "./client.js",
            "./shared/*.js",
            "./client/*.js",
        ],
        ['client']
    );
});

gulp.task('default', ['server', 'watch-server', 'client', 'watch-client']);

process.on("exit", function() {
    if (node) node.kill();
});
