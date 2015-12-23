/*
* Shows an overview over all levels, additional information per level. Allows starting
* levels.
*
* Next state: Play
*/
function SelectLevel() {}

inherit(State, SelectLevel);

SelectLevel.LEVEL_INFO_STYLE = {
  fill: '#ffffff',
  font: 'normal 8px monospace'
};
SelectLevel.LEVEL_NAME_STYLE = {
  fill: '#ffffff',
  font: 'bold 8px monospace'
};

SelectLevel.prototype.create = function() {
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
};

SelectLevel.prototype.addActiveLevelMarker = function() {
  this.activeLevelMarker = this.add.sprite(50, 50, 'ActivePlanetMarker');
  this.activeLevelMarker.anchor.setTo(0.5, 0.5);
  this.activeLevelMarker.animations.add('loop', ALL_FRAMES, 16, LOOP_ANIMATION);
  this.activeLevelMarker.play('loop');
  this.activeLevelMarker.visible = false;
};

SelectLevel.prototype.addSoundSprite = function() {
  this.soundSprite = this.add.sprite(315, 195, 'Sound');
  this.soundSprite.anchor.setTo(1, 1);
  this.soundSprite.inputEnabled = true;
  this.soundSprite.events.onInputUp.add(this.toggleSound, this);
};

SelectLevel.prototype.toggleSound = function() {
  this.game.soundActive = !this.game.soundActive;
  this.soundSprite.frame = this.game.soundActive ? 0 : 1;
};

SelectLevel.prototype.showActiveLevelMarker = function(sprite) {
  this.activeLevelMarker.position.setTo(sprite.x, sprite.y);
  this.activeLevelMarker.visible = true;
};

SelectLevel.prototype.createLevelSprite = function(level) {
  var sprite = this.add.sprite(level.x, level.y, 'MiniPlanets', level.miniPlanet);
  sprite.rotation = Math.PI * 2 * Math.random();
  sprite.anchor.setTo(0.5, 0.5);
  sprite.inputEnabled = true;
  sprite.events.onInputUp.add(this.showLevelInfo, this, 0, level.key, level.name, level.shortDescription);
  return sprite;
};

SelectLevel.prototype.showLevelInfo = function(sprite, pointer, $, levelKey, name, info) {
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
};

SelectLevel.prototype.highlightStartLevelText = function() {
  this.startLevelText.setStyle(LEVEL_START_STYLE_HOVER);
};

SelectLevel.prototype.unhighlightStartLevelText = function() {
  this.startLevelText.setStyle(LEVEL_START_STYLE);
};

SelectLevel.prototype.startLevel = function() {
  this.state.start('Play', CLEAR_WORLD, !CLEAR_CACHE, this.game.levels.byKey(this.currentLevelKey));
};

SelectLevel.prototype.update = function() {
  this.levelSprites.forEach(
    function(sprite) {
      sprite.rotation += 0.01;
    }
  );
};
