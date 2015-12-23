/*
* Temporary state, living only long enough to load everything necessary for preloader.
*
* Next state: Preload
*/
function Boot() {}

inherit(State, Boot);

Boot.SCALE = 2;

Boot.prototype.preload = function() {
  this.setScaling(Boot.SCALE, Boot.SCALE);
  this.loadImage('PreloadBackground');
  this.loadImage('PreloadBar');
};

Boot.prototype.setScaling = function(h, v) {
  Phaser.Canvas.setImageRenderingCrisp(this.game.canvas); // For compatible browsers
  PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST; // For WebGL
  Phaser.Canvas.setSmoothingEnabled(this.game.context, false); // For 2D canvas
  this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
  this.game.scale.setUserScale(h, v);
};

Boot.prototype.create = function() {
  this.state.start('Preload');
};
