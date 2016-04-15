/*
* Shows an overview over all levels, additional information per level. Allows starting
* levels.
*
* Next state: Play
*/
class SelectLevel extends State {

  create() {
    this.createBackground();
    this.addActiveLevelMarker();
    this.addSoundSprite();
    this.levelSprites = this.game.levels.available().map(this.createLevelSprite, this);
    this.levelInfoText = this.add.text(160, 190, '', SelectLevel.LEVEL_INFO_STYLE);
    this.levelInfoText.anchor.setTo(0.5, 1);
    this.levelInfoText.visible = false;
    this.levelNameText = this.add.text(160, 0, '', SelectLevel.LEVEL_NAME_STYLE);
    this.levelNameText.anchor.setTo(0, 1);
    this.levelNameText.visible = false;
    this.startLevelText = this.add.text(160, 190, 'Start!', LEVEL_START_STYLE);
    this.startLevelText.anchor.setTo(0.5, 0);
    this.startLevelText.inputEnabled = true;
    this.startLevelText.events.onInputOver.add(this.highlightStartLevelText, this);
    this.startLevelText.events.onInputOut.add(this.unhighlightStartLevelText, this);
    this.startLevelText.events.onInputDown.add(this.startLevel, this);
    this.startLevelText.visible = false;
    this.currentLevelKey = null;
  }

  addActiveLevelMarker() {
    this.activeLevelMarker = this.add.sprite(50, 50, 'ActivePlanetMarker');
    this.activeLevelMarker.anchor.setTo(0.5, 0.5);
    this.activeLevelMarker.animations.add('loop', ALL_FRAMES, 16, LOOP_ANIMATION);
    this.activeLevelMarker.play('loop');
    this.activeLevelMarker.visible = false;
  }

  addSoundSprite() {
    this.soundSprite = this.add.sprite(315, 195, 'Sound');
    this.soundSprite.anchor.setTo(1, 1);
    this.soundSprite.inputEnabled = true;
    this.soundSprite.events.onInputUp.add(this.toggleSound, this);
  }

  toggleSound() {
    this.game.soundActive = !this.game.soundActive;
    this.soundSprite.frame = this.game.soundActive ? 0 : 1;
  }

  showActiveLevelMarker(sprite) {
    this.activeLevelMarker.position.setTo(sprite.x, sprite.y);
    this.activeLevelMarker.visible = true;
  }

  createLevelSprite(level) {
    var sprite = this.add.sprite(level.x, level.y, 'MiniPlanets', level.miniPlanet);
    sprite.rotation = Math.PI * 2 * Math.random();
    sprite.anchor.setTo(0.5, 0.5);
    sprite.inputEnabled = true;
    sprite.events.onInputUp.add(this.showLevelInfo, this, 0, level.key, level.name, level.shortDescription);
    return sprite;
  }

  showLevelInfo(sprite, pointer, $, levelKey, name, info) {
    this.showActiveLevelMarker(sprite);
    this.levelInfoText.setText(info);
    this.levelInfoText.visible = true;
    this.levelNameText.setText(name);
    this.startLevelText.visible = true;
    this.levelNameText.visible = true;
    this.currentLevelKey = levelKey;
    var textBounds = this.levelInfoText.getBounds();
    this.levelNameText.position.setTo(textBounds.x, textBounds.y);
    this.game.playRandomSound();
  }

  highlightStartLevelText() {
    this.startLevelText.setStyle(LEVEL_START_STYLE_HOVER);
  }

  unhighlightStartLevelText() {
    this.startLevelText.setStyle(LEVEL_START_STYLE);
  }

  startLevel() {
    this.state.start('Play', CLEAR_WORLD, !CLEAR_CACHE, this.game.levels.byKey(this.currentLevelKey));
  }

  update() {
    this.levelSprites.forEach(
      (sprite) => sprite.rotation += 0.01
    );
  }
}

SelectLevel.LEVEL_INFO_STYLE = {
  fill: '#ffffff',
  font: 'normal 8px monospace'
};
SelectLevel.LEVEL_NAME_STYLE = {
  fill: '#ffffff',
  font: 'bold 8px monospace'
};
