  var TRANSPARENT = true;
  var ANTIALIASING = true;
  var AUTOSTART = true;
  var CLEAR_WORLD = true;
  var CLEAR_CACHE = true;
  var ALL_FRAMES = null;
  var ANIMATION_FPS = 8;
  var LOOP_ANIMATION = true;
  var PLANT_DISTANCE = 80;

  var LEVEL_START_STYLE = {
    fill: '#00ff00',
    font: 'bold 8px monospace'
  };
  var LEVEL_START_STYLE_HOVER = Object.assign({}, LEVEL_START_STYLE, { fill: '#ffff00'});

  export function create(domId) {
    var game = new Phaser.Game(320, 200, Phaser.CANVAS, 'game', null, !TRANSPARENT, !ANTIALIASING);
    game.state.add('Boot', new Boot(), AUTOSTART)
    game.state.add('Preload', new Preload());
    game.state.add('SelectLevel', new SelectLevel());
    game.state.add('Play', new Play());
    game.state.add('ShowLevelResult', new ShowLevelResult());
    game.soundActive = true;
    game.playRandomSound = function(container) {
      if (this.soundActive) {
        this.sound.play(Preload.SOUNDS[Math.floor(Math.random() * Preload.SOUNDS.length)]);
      }
    };
  };

  /*
  * Takes a type of the form 'Foobar-2', a suffix and the number of frames for
  * that type. Returns an object containing a sprite key and the index of the
  * first frame.
  * Example:
  * splitType('Foobar-3', 'Baz', 6) =>
  * {
  *   spriteKey: 'FoobarBaz',
  *   frameIndex: 17
  * }
  */
  function splitType(type, keySuffix, frames) {
    return {
      spriteKey: type.replace(/-([0-9]+)$/, keySuffix),
      frameIndex: (frames || 1) * type.replace(/^.*-([0-9]+)$/, '$1') - 1
    };
  }
