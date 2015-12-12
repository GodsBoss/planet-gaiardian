var game = (function(_, Phaser) {

  var TRANSPARENT = true;
  var ANTIALIASING = true;
  var AUTOSTART = true;

  var inherit = (function() {
    function F(){}
    return function(parent, child) {
      F.prototype = parent.prototype;
      child.prototype = new F();
    }
  })();
  var myGame = {};

  myGame.create = function(domId) {
    var game = new Phaser.Game(640, 400, Phaser.AUTO, 'game', null, !TRANSPARENT, !ANTIALIASING);
    game.state.add('Boot', new Boot(), AUTOSTART)
    game.state.add('Preload', new Preload());
    game.state.add('SelectLevel', new SelectLevel());
    game.state.add('Play', new Play());
    game.state.add('ShowLevelResult', new ShowLevelResult());
  };

  function State() {}

  State.prototype.loadImage = function(key) {
    this.load.image(key, 'gfx/' + key + '.png');
  };

  State.prototype.createBackground = function(spriteKey) {
    var background = this.add.sprite(this.world.centerX, this.world.centerY, spriteKey || (this.key + 'Background'));
    background.anchor.setTo(0.5, 0.5);
    background.scale.setTo(2, 2);
    return background;
  };

  function Boot() {}

  inherit(State, Boot);

  Boot.prototype.preload = function() {
    this.loadImage('PreloadBackground');
    this.loadImage('PreloadBar');
  };

  Boot.prototype.create = function() {
    this.state.start('Preload');
  }

  function Preload(){}

  inherit(State, Preload);

  Preload.prototype.preload = function() {
    this.createBackground();
    var preloaderBar = this.add.sprite(this.world.centerX, this.world.centerY, 'PreloadBar');
    preloaderBar.anchor.setTo(0.5, 0.5);
    this.load.setPreloadSprite(preloaderBar);
    this.loadImage('SelectLevelBackground');
  };

  Preload.prototype.create = function() {
    this.state.start('SelectLevel');
  };

  function SelectLevel() {}

  inherit(State, SelectLevel);

  SelectLevel.prototype.create = function() {
    this.createBackground();
  };

  SelectLevel.prototype.update = function() {}

  function Play() {}

  inherit(State, Play);

  Play.prototype.update = function() {}

  function ShowLevelResult() {}

  inherit(State, ShowLevelResult);

  ShowLevelResult.prototype.update = function() {}

  return myGame;

})(_, Phaser);
