  var TRANSPARENT = true;
  var ANTIALIASING = true;
  var AUTOSTART = true;
  var CLEAR_WORLD = true;
  var CLEAR_CACHE = true;
  var ALL_FRAMES = null;
  var ANIMATION_FPS = 8;
  var LOOP_ANIMATION = true;
  var PLANT_DISTANCE = 80;

  var LEVEL_INFO_STYLE = {
    fill: '#ffffff',
    font: 'normal 8px monospace'
  };
  var LEVEL_NAME_STYLE = {
    fill: '#ffffff',
    font: 'bold 8px monospace'
  };
  var LEVEL_START_STYLE = {
    fill: '#00ff00',
    font: 'bold 8px monospace'
  };
  var LEVEL_START_STYLE_HOVER = _.merge({}, LEVEL_START_STYLE, { fill: '#ffff00'});

  var VICTORY_STYLE = {
    fill: '#ccffcc',
    font: 'bold 10px monospace'
  };
  var DEFEAT_STYLE = {
    fill: '#ffcccc',
    font: 'bold 10px monospace'
  };
  var VICTORY_TEXT = 'Victory!';
  var DEFEAT_TEXT = 'You lost!';

  var SCALE = 2;

  var inherit = (function() {
    function F(){}
    return function(parent, child) {
      F.prototype = parent.prototype;
      child.prototype = new F();
    }
  })();

  export function create(domId) {
    var game = new Phaser.Game(320, 200, Phaser.AUTO, 'game', null, !TRANSPARENT, !ANTIALIASING);
    game.state.add('Boot', new Boot(), AUTOSTART)
    game.state.add('Preload', new Preload());
    game.state.add('SelectLevel', new SelectLevel());
    game.state.add('Play', new Play());
    game.state.add('ShowLevelResult', new ShowLevelResult());
    game.soundActive = true;
    game.playRandomSound = function(container) {
      if (this.soundActive) {
        this.sound.play(SOUNDS[Math.floor(Math.random() * SOUNDS.length)]);
      }
    };
  };

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

  /*
  * Temporary state, living only long enough to load everything necessary for preloader.
  *
  * Next state: Preload
  */
  function Boot() {}

  /*
  * Temporary states. Shows a bootloading animation and loads all sounds, graphics, etc.
  *
  * Next state: SelectLevel
  */
  function Preload(){}

  /*
  * Shows an overview over all levels, additional information per level. Allows starting
  * levels.
  *
  * Next state: Play
  */
  function SelectLevel() {}

  /*
  * The actual game. Player can interact and must play to win.
  *
  * Next state: ShowLevelResult
  */
  function Play() {}

  /*
  * Shown after a level is over.
  *
  * Next state: SelectLevel
  */
  function ShowLevelResult() {}

  [Boot, Preload, SelectLevel, Play, ShowLevelResult].forEach(
    function (SpecificState) {
      inherit(State, SpecificState);
    }
  );

  Boot.prototype.preload = function() {
    this.setScaling(SCALE, SCALE);
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
  }

  Preload.prototype.preload = function() {
    this.createBackground();
    var preloaderBar = this.add.sprite(this.world.centerX, this.world.centerY, 'PreloadBar');
    preloaderBar.anchor.setTo(0.5, 0.5);
    this.load.setPreloadSprite(preloaderBar);
    PRELOAD_IMAGES.forEach(function(image) {this.loadImage(image);}, this);
    PLANT_SPRITESHEETS.forEach(function(sheet) {this.loadPlantSpritesheet(sheet);}, this);
    TOOL_SPRITESHEETS.forEach(function(sheet) {this.loadToolSpritesheet(sheet);}, this);
    SOUNDS.forEach(function(key) {this.load.audio(key, 'sfx/' + key + '.wav')}, this);
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

  SelectLevel.prototype.create = function() {
    this.createBackground();
    this.addActiveLevelMarker();
    this.addSoundSprite();
    this.levelSprites = this.game.levels.available().map(this.createLevelSprite, this);
    this.levelInfoText = this.add.text(160, 190, '', LEVEL_INFO_STYLE);
    this.levelInfoText.anchor.setTo(0.5, 1);
    this.levelInfoText.visible = false;
    this.levelNameText = this.add.text(160, 0, '', LEVEL_NAME_STYLE);
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

  Play.prototype.init = function(level) {
    this.level = level;
    this.rotation = 0;
    this.createBackground(this.level.background);
  };

  Play.prototype.create = function() {
    this.addPlanet();
    this.plants = new Plants(this, this.level);
    this.addPlayer();
    this.tools = new Tools(this, this.level);
    this.addVictoryConditions();
    this.addTimer();
    this.bindKeys();
  };

  Play.prototype.addPlanet = function() {
    this.planet = this.add.sprite(100, 100, this.level.planet);
    this.planet.anchor.setTo(0.5, 0.5);
  };

  Play.prototype.addPlayer = function() {
    this.player = this.add.sprite(100, 12, 'Player');
    this.player.anchor.setTo(0.5, 0);
    this.player.animations.add('run', ALL_FRAMES, ANIMATION_FPS, LOOP_ANIMATION);
    this.player.play('run');
  };

  Play.prototype.addVictoryConditions = function()
  {
    this.victoryConditions = new VictoryConditions(this, this.level);
    this.victoryConditions.show(this.plants);
  };

  Play.prototype.addTimer = function() {
    this.timer = new Timer(this, this.level.time);
  };

  Play.prototype.bindKeys = function() {
    var keyCodeForN = 78;
    var keyCodeForU = 85;
    this.input.keyboard.addKey(keyCodeForN).onUp.add(this.switchTool, this);
    this.input.keyboard.addKey(keyCodeForU).onUp.add(this.useTool, this);
  };

  Play.prototype.switchTool = function() {
    this.tools.switch();
    this.game.playRandomSound();
  };

  Play.prototype.useTool = function() {
    this.plants.useTool(this.tools.current());
    this.victoryConditions.show(this.plants);
    if (this.level.isWon(this.plants)) {
      this.state.start('ShowLevelResult', CLEAR_WORLD, !CLEAR_CACHE, this.level, true);
    }
    this.game.playRandomSound();
  };

  Play.prototype.update = function() {
    this.rotation += 0.01;
    this.planet.rotation = -this.rotation;
    this.plants.move(this.rotation);
    if (this.timer.timeIsUp()) {
      this.state.start('ShowLevelResult', CLEAR_WORLD, !CLEAR_CACHE, this.level, false);
    }
  }

  ShowLevelResult.prototype.init = function(level, victorious) {
    if (victorious) {
      this.game.levels.won(level);
    }
    this.level = level;
    this.victorious = victorious;
  };

  ShowLevelResult.prototype.create = function() {
    this.createBackground(this.level.background);
    this.addPlanet();
    this.addTitle();
    this.addOkButton();
  };

  ShowLevelResult.prototype.addTitle = function() {
    this.title = this.add.text(5, 10, this.victorious ? VICTORY_TEXT : DEFEAT_TEXT);
    this.title.anchor.setTo(0, 0);
    this.title.setStyle(this.victorious ? VICTORY_STYLE : DEFEAT_STYLE);
  };

  ShowLevelResult.prototype.addOkButton = function() {
    this.button = this.add.text(5, 195, 'Back to level selection');
    this.button.anchor.setTo(0, 1);
    this.button.setStyle(LEVEL_START_STYLE);
    this.button.inputEnabled = true;
    this.button.events.onInputOver.add(this.highlightOkButton, this);
    this.button.events.onInputOut.add(this.unhighlightOkButton, this);
    this.button.events.onInputDown.add(this.backToLevelSelect, this);
  };

  ShowLevelResult.prototype.highlightOkButton = function() {
    this.button.setStyle(LEVEL_START_STYLE_HOVER);
  };

  ShowLevelResult.prototype.unhighlightOkButton = function() {
    this.button.setStyle(LEVEL_START_STYLE);
  };

  ShowLevelResult.prototype.backToLevelSelect = function() {
    this.state.start('SelectLevel');
  };

  ShowLevelResult.prototype.addPlanet = Play.prototype.addPlanet;

  ShowLevelResult.prototype.update = function() {}

  /*
  * Takes a type of the form 'Foobar-2', a suffix and the number of frames for
  * that type. Returns an object containing a sprite key and the index of the
  * first frame.
  * Example:
  * splitType('Foobar-3', 'Baz', 6) =>
  * {
  *   spriteKey: 'FoobarBaz',
  *   frameIndex: 17
  * }
  */
  function splitType(type, keySuffix, frames) {
    return {
      spriteKey: type.replace(/-([0-9]+)$/, keySuffix),
      frameIndex: (frames || 1) * type.replace(/^.*-([0-9]+)$/, '$1') - 1
    };
  }

  var PRELOAD_IMAGES = [
    'DesertPlanet',
    'GreenPlanet',
    'InvertedYellowBackground',
    'MushroomPlanet',
    'Planet1',
    'PlayBackgroundBlue',
    'SelectLevelBackground'
  ];

  var PLANT_SPRITESHEETS = [
    'CactusWorldPlant',
    'GreenPlant',
    'MushroomPlant',
    'TutorialPlant',
    'YellowFeverPlant'
  ];

  var TOOL_SPRITESHEETS = [
    'CactusWorldTool',
    'GreenTool',
    'MushroomTool',
    'TutorialTool',
    'YellowFeverTool'
  ];

  var SOUNDS = ['1', '2', '3', '4', '5'];
