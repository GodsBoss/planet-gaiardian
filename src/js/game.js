var game = (function(_, Phaser) {

  var TRANSPARENT = true;
  var ANTIALIASING = true;
  var AUTOSTART = true;

  var myGame = {};

  myGame.create = function(domId) {
    var game = new Phaser.Game(640, 400, Phaser.AUTO, 'game', null, !TRANSPARENT, !ANTIALIASING);
    game.state.add('preload', createPreload(), AUTOSTART);
  };

  return myGame;

function createPreload()
{
  return {
    preload: function() {
      this.load.image('preload-screen', 'gfx/preload-screen.png');
    },
    create: function() {
      var preloaderScreen = this.add.sprite(this.world.centerX, this.world.centerY, 'preload-screen');
      preloaderScreen.anchor.setTo(0.5, 0.5);
    }
  }
}

})(_, Phaser);
