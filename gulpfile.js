var gulp = require('gulp'),
    childProcess = require('child_process'),
    chalk = require('chalk'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify');

var node,
    chalkColor = chalk.cyan;

gulp.task('server', function() {
    var prefix = '[' + chalkColor('gulp-server') + ']';
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
    var prefix = '[' + chalkColor('gulp-watch-server') + ']';
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
    var prefix = '[' + chalkColor('gulp-client') + ']';

    var val = browserify('./client.js')
        .bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest('./public'));

    console.log(prefix, "Client script bundled");
    return val;
});

gulp.task('watch-client', function(cb) {
    var prefix = '[' + chalkColor('gulp-watch-client') + ']';
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
