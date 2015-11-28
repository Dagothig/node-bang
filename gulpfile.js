var gulp = require('gulp'),
    childProcess = require('child_process'),
    chalk = require('chalk'),
    node;

var chalkColor = chalk.cyan;

gulp.task('server', function() {
    var prefix = '[' + chalkColor('gulp-server') + ']';
    if (node) {
        console.log(prefix, 'Killing server');
        node.kill();
    }
    console.log(prefix, 'Attempting to start server...');
    node = childProcess.spawn(
        'node',
        ['server.js'],
        { stdio: 'inherit' }
    );
});

gulp.task('watch-server', function(cb) {
    var prefix = '[' + chalkColor('gulp-watch-server') + ']';
    console.log(prefix, "Watching server files...");
    return gulp.watch([
            "./server.js",
            "./server/*.js"
        ],
        ['server']
    );
});

gulp.task('default', ['server', 'watch-server']);

process.on("exit", function() {
    if (node) node.kill();
});
