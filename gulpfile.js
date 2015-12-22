var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

gulp.task(
  'build:js',
  function() {
    gulp.
      src('src/js/game.js').
      pipe(sourcemaps.init()).
      pipe(concat('game.js')).
      pipe(sourcemaps.write('.')).
      pipe(gulp.dest('./dist/'));
  }
);
