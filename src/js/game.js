var game = (function(_, Phaser) {

  var TRANSPARENT = true;
  var ANTIALIASING = true;
  var AUTOSTART = true;

  var myGame = {};

  myGame.create = function(domId) {
    var game = new Phaser.Game(640, 400, Phaser.AUTO, 'game', null, !TRANSPARENT, !ANTIALIASING);
    game.state.add('boot', new Boot(), AUTOSTART)
    game.state.add('preload', new Preload());
    game.state.add('selectLevel', new SelectLevel());
    game.state.add('play', new Play());
    game.state.add('showLevelResult', new ShowLevelResult());
  };

  function Boot() {}

  Boot.prototype.preload = function() {
    this.load.image('preload-screen', 'gfx/preload-screen.png');
    this.load.image('preload-bar', 'gfx/preload-bar.png');
  };

  Boot.prototype.create = function() {
    this.state.start('preload');
  }

  function Preload(){}

  Preload.prototype.preload = function() {
    var preloaderScreen = this.add.sprite(this.world.centerX, this.world.centerY, 'preload-screen');
    preloaderScreen.anchor.setTo(0.5, 0.5);
    preloaderScreen.scale.setTo(2, 2);
    var preloaderBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preload-bar');
    preloaderBar.anchor.setTo(0.5, 0.5);
    this.load.setPreloadSprite(preloaderBar);
    this.load.image('select-level-screen', 'gfx/select-level-screen.png');
  };

  Preload.prototype.create = function() {
    this.state.start('selectLevel');
  };

  function SelectLevel() {}

  SelectLevel.prototype.create = function() {
    var screen = this.add.sprite(this.world.centerX, this.world.centerY, 'select-level-screen');
    screen.anchor.setTo(0.5, 0.5);
    screen.scale.setTo(2, 2);
  };

  SelectLevel.prototype.update = function() {}

  function Play() {}

  Play.prototype.update = function() {}

  Play.prototype.update = function() {}

  function ShowLevelResult() {}

  ShowLevelResult.prototype.update = function() {}

  ShowLevelResult.prototype.update = function() {}

return myGame;

})(_, Phaser);
