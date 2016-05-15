var gulp = require('gulp');
var todo = require('gulp-todo');
var lint = require('gulp-eslint');

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
  lint: {
    rules: {
      'no-reserved-keys': 0,
    },
    parserOptions: {
      'ecmaVersion': 6,
    },
  }
};

gulp.task('todo', toDoTask);

gulp.task('lint', lintTask);

gulp.task('default', ['todo', 'lint']);

function lintTask() {
  return gulp
    .src(paths.js)
    .pipe(lint(options.lint))
    .pipe(lint.format())
    .pipe(lint.failAfterError());
}

function toDoTask() {
  return gulp
    .src(paths.js)
    .pipe(todo(options.todo))
    .pipe(gulp.dest(paths.src));
}
