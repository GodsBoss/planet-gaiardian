var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

gulp.task(
  'build:js',
  function() {
    gulp.
      src('src/js/game.js').
      pipe(sourcemaps.init()).
      pipe(concat('game.js')).
      pipe(babel({presets: ['es2015']})).
      pipe(sourcemaps.write('.')).
      pipe(gulp.dest('./dist/'));
  }
);
