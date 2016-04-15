/*
* Temporary states. Shows a bootloading animation and loads all sounds, graphics, etc.
*
* Next state: SelectLevel
*/
class Preload extends State {

  preload() {
    this.createBackground();
    var preloaderBar = this.add.sprite(this.world.centerX, this.world.centerY, 'PreloadBar');
    preloaderBar.anchor.setTo(0.5, 0.5);
    this.load.setPreloadSprite(preloaderBar);
    Preload.PRELOAD_IMAGES.forEach((image) => this.loadImage(image));
    Preload.PLANT_SPRITESHEETS.forEach((sheet) => this.loadPlantSpritesheet(sheet));
    Preload.TOOL_SPRITESHEETS.forEach((sheet) => this.loadToolSpritesheet(sheet));
    Preload.SOUNDS.forEach((key) => this.load.audio(key, 'sfx/' + key + '.wav'));
    this.loadSpritesheet('Player', 15, 15);
    this.loadSpritesheet('ActiveToolMarker', 24, 24);
    this.loadSpritesheet('ActivePlanetMarker', 30, 30);
    this.loadSpritesheet('MiniPlanets', 15, 15);
    this.loadSpritesheet('Sound', 20, 20);
    this.load.json('levels', 'levels.json?' + new Date());
  }

  loadPlantSpritesheet(key) {
    this.load.spritesheet(key, 'gfx/' + key + '.png', 15, 15);
  }

  loadToolSpritesheet(key) {
    this.load.spritesheet(key, 'gfx/' + key + '.png', 20, 20);
  }

  create() {
    this.game.levels = new Levels(this.cache.getJSON('levels'));
    this.state.start('SelectLevel');
  }
}

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
