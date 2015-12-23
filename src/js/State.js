function State() {}

State.prototype.loadImage = function(key) {
  this.load.image(key, 'gfx/' + key + '.png');
};

State.prototype.loadSpritesheet = function(key, frameWidth, frameHeight, frameMax, margin, spacing) {
  this.load.spritesheet(key, 'gfx/' + key + '.png', frameWidth, frameHeight, frameMax, margin, spacing);
};

State.prototype.createBackground = function(spriteKey) {
  var background = this.add.sprite(this.world.centerX, this.world.centerY, spriteKey || (this.key + 'Background'));
  background.anchor.setTo(0.5, 0.5);
  return background;
};
