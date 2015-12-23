/*
* Temporary states. Shows a bootloading animation and loads all sounds, graphics, etc.
*
* Next state: SelectLevel
*/
function Preload(){}

inherit(State, Preload);

Preload.PRELOAD_IMAGES = [
  'DesertPlanet',
  'GreenPlanet',
  'InvertedYellowBackground',
  'MushroomPlanet',
  'Planet1',
  'PlayBackgroundBlue',
  'SelectLevelBackground'
];

Preload.PLANT_SPRITESHEETS = [
  'CactusWorldPlant',
  'GreenPlant',
  'MushroomPlant',
  'TutorialPlant',
  'YellowFeverPlant'
];

Preload.TOOL_SPRITESHEETS = [
  'CactusWorldTool',
  'GreenTool',
  'MushroomTool',
  'TutorialTool',
  'YellowFeverTool'
];

Preload.SOUNDS = ['1', '2', '3', '4', '5'];

Preload.prototype.preload = function() {
  this.createBackground();
  var preloaderBar = this.add.sprite(this.world.centerX, this.world.centerY, 'PreloadBar');
  preloaderBar.anchor.setTo(0.5, 0.5);
  this.load.setPreloadSprite(preloaderBar);
  Preload.PRELOAD_IMAGES.forEach(function(image) {this.loadImage(image);}, this);
  Preload.PLANT_SPRITESHEETS.forEach(function(sheet) {this.loadPlantSpritesheet(sheet);}, this);
  Preload.TOOL_SPRITESHEETS.forEach(function(sheet) {this.loadToolSpritesheet(sheet);}, this);
  Preload.SOUNDS.forEach(function(key) {this.load.audio(key, 'sfx/' + key + '.wav')}, this);
  this.loadSpritesheet('Player', 15, 15);
  this.loadSpritesheet('ActiveToolMarker', 24, 24);
  this.loadSpritesheet('ActivePlanetMarker', 30, 30);
  this.loadSpritesheet('MiniPlanets', 15, 15);
  this.loadSpritesheet('Sound', 20, 20);
  this.load.json('levels', 'levels.json?' + new Date());
};

Preload.prototype.loadPlantSpritesheet = function(key) {
  this.load.spritesheet(key, 'gfx/' + key + '.png', 15, 15);
};

Preload.prototype.loadToolSpritesheet = function(key) {
  this.load.spritesheet(key, 'gfx/' + key + '.png', 20, 20);
};

Preload.prototype.create = function() {
  this.game.levels = new Levels(this.cache.getJSON('levels'));
  this.state.start('SelectLevel');
};
