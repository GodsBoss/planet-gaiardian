var game = (function(_, Phaser) {

  var TRANSPARENT = true;
  var ANTIALIASING = true;

  var myGame = {};

  myGame.create = function(domId) {
    var game = new Phaser.Game(640, 400, Phaser.AUTO, 'game', null, !TRANSPARENT, !ANTIALIASING);
  };

  return myGame;

})(_, Phaser);
