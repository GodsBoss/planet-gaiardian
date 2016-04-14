/*
* A single plant.
*/
class Plant {
  constructor(plants, state, type, position) {
    this.plants = plants;
    this.type = type;
    this.position = position;
    this.state = state;

    var spriteInfo = splitType(type, 'Plant', 2);
    var frameIndex = spriteInfo.frameIndex;
    var spriteKey = spriteInfo.spriteKey;
    var sprite = state.add.sprite(0, 0, spriteKey);
    sprite.anchor.setTo(0.5, 0.5);
    var animation = sprite.animations.add('stand', [frameIndex-1, frameIndex], ANIMATION_FPS, LOOP_ANIMATION);
    sprite.play('stand');

    // Avoid synchronized animations.
    var animationOffset = Math.floor(Math.random() * animation.delay);
    animation._timeNextFrame += animationOffset;
    animation._timeLastFrame += animationOffset;

    this.sprite = sprite;
    this.move(0);
  }

  move(rotation) {
    this.sprite.rotation = this.position - rotation;
    this.sprite.position.setTo(
      100 - PLANT_DISTANCE * Math.sin(-this.sprite.rotation),
      100 - PLANT_DISTANCE * Math.cos(-this.sprite.rotation)
    );
  }

  convertTypeTo(newType) {
    this.plants.counts[this.type]--;
    this.plants.counts[newType]++;
    this.type = newType;
    var spriteInfo = splitType(this.type, 'Plant', 2);
    var newSprite = this.state.add.sprite(this.sprite.x, this.sprite.y, spriteInfo.spriteKey);
    newSprite.anchor.setTo(0.5, 0.5);
    newSprite.animations.add('stand', [spriteInfo.frameIndex-1, spriteInfo.frameIndex], ANIMATION_FPS, LOOP_ANIMATION);
    newSprite.play('stand');
    this.state.player.bringToTop();
    this.sprite.kill();
    this.sprite.animations.getAnimation('stand').stop();
    this.sprite.animations.getAnimation('stand').destroy();
    this.sprite = newSprite;
  }

  isCurrent() {
    return Math.abs(this.sprite.rotation % (Math.PI*2)) < 0.13;
  }
}
