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
    './bundles/**/*.js',
    '!./**/node_modules/**'],
};

const report = {
  ignore: 0,
  warn: 1,
  error: 2,
};

var options = {
  todo: {
    absolute: true,
    fileName: 'gulpTODO.md'
  },
  lint: {
    rules: {
      'no-reserved-keys':  report.ignore,

      'no-cond-assign':    report.warn,
      'no-dupe-args':      report.warn,
      'no-dupe-keys':      report.warn,
      'no-duplicate-case': report.warn,
      'no-extra-semi':     report.warn,
      'no-func-assign':    report.warn,
      'no-sparse-arrays':  report.warn,
      'yoda':              report.warn,
      'camelcase':         report.warn,

      'use-isnan':         report.error,
      'valid-typeof':      report.error,
      'no-unreachable':    report.error,
      'no-undef':  report.error,

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
