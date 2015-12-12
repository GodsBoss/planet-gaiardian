var game = (function(_, Phaser) {

  var myGame = {};

  myGame.create = function(domId) {
    var game = new Phaser.Game(640, 400, Phaser.AUTO, 'game', null, false, true);
  };

  return myGame;

})(_, Phaser);
