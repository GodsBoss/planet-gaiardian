/*
* Temporary state, living only long enough to load everything necessary for preloader.
*
* Next state: Preload
*/
class Boot extends State {

  preload() {
    this.setScaling(Boot.SCALE, Boot.SCALE);
    this.loadImage('PreloadBackground');
    this.loadImage('PreloadBar');
  }

  setScaling(h, v) {
    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas); // For compatible browsers
    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST; // For WebGL
    Phaser.Canvas.setSmoothingEnabled(this.game.context, false); // For 2D canvas
    this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    this.game.scale.setUserScale(h, v);
  }

  create() {
    this.state.start('Preload');
  }
}

Boot.SCALE = 2;
