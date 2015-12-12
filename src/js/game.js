var game = (function(_, Phaser) {

  var TRANSPARENT = true;
  var ANTIALIASING = true;
  var AUTOSTART = true;

  var myGame = {};

  myGame.create = function(domId) {
    var game = new Phaser.Game(640, 400, Phaser.AUTO, 'game', null, !TRANSPARENT, !ANTIALIASING);
    game.state.add('boot', createBoot(), AUTOSTART)
    game.state.add('preload', createPreload());
  };

  return myGame;

function createBoot()
{
  return {
    preload: function() {
      this.load.image('preload-screen', 'gfx/preload-screen.png');
      this.load.image('preload-bar', 'gfx/preload-bar.png');
    },
    create: function() {
      this.state.start('preload');
    }
  }
}

function createPreload()
{
  return {
    preload: function() {
      var preloaderScreen = this.add.sprite(this.world.centerX, this.world.centerY, 'preload-screen');
      preloaderScreen.anchor.setTo(0.5, 0.5);
      preloaderScreen.scale.setTo(2, 2);
      var preloaderBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preload-bar');
      preloaderBar.anchor.setTo(0.5, 0.5);
      this.load.setPreloadSprite(preloaderBar);
    }
  }
}

})(_, Phaser);
