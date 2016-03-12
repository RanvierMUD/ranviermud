var gulp = require('gulp');
var todo = require('gulp-todo');

var paths = {
  src: './',
  spec: './spec/*.js',
  js: [
    './*.js',
    './src/*.js',
    './src/**/*.js',
    './scripts/**/*.js',
    './scripts/**/**/*.js',
    './commands/*.js'
  ],
};

var options = {
  todo: {
    absolute: true
  },
};

gulp.task('todo', toDoTask);

function toDoTask() {
  gulp.src(paths.js)
    .pipe(todo(options.todo))
    .pipe(gulp.dest(paths.src));
}