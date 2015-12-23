var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

gulp.task(
  'build:js',
  function() {
    gulp.
      src(JS_FILES).
      pipe(sourcemaps.init()).
      pipe(concat('game.js')).
      pipe(babel({presets: ['es2015']})).
      pipe(uglify()).
      pipe(sourcemaps.write('.')).
      pipe(gulp.dest('./dist/'));
  }
);

var JS_FILES = [
  'Level',
  'Levels',
  'Plant',
  'Plants',
  'Timer',
  'Tool',
  'Tools',
  'VictoryCondition',
  'VictoryConditions',
  'game'
].map((file) => 'src/js/' + file + '.js');
