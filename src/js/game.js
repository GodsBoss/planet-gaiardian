var game = (function(_, Phaser) {

  var TRANSPARENT = true;
  var ANTIALIASING = true;
  var AUTOSTART = true;
  var CLEAR_WORLD = true;
  var CLEAR_CACHE = true;
  var ALL_FRAMES = null;
  var ANIMATION_FPS = 8;
  var LOOP_ANIMATION = true;
  var PLANT_DISTANCE = 160;
  var LEVEL_INFO_STYLE = {
    fill: '#ffffff',
    font: 'normal 10px monospace'
  };
  var LEVEL_NAME_STYLE = {
    fill: '#ffffff',
    font: 'bold 10px monospace'
  };
  var LEVEL_START_STYLE = {
    fill: '#00ff00',
    font: 'bold 10px monospace'
  };
  var LEVEL_START_STYLE_HOVER = _.merge({}, LEVEL_START_STYLE, { fill: '#ffff00'});

  var inherit = (function() {
    function F(){}
    return function(parent, child) {
      F.prototype = parent.prototype;
      child.prototype = new F();
    }
  })();
  var myGame = {};

  myGame.create = function(domId) {
    var game = new Phaser.Game(640, 400, Phaser.AUTO, 'game', null, !TRANSPARENT, !ANTIALIASING);
    game.state.add('Boot', new Boot(), AUTOSTART)
    game.state.add('Preload', new Preload());
    game.state.add('SelectLevel', new SelectLevel());
    game.state.add('Play', new Play());
    game.state.add('ShowLevelResult', new ShowLevelResult());
  };

  function State() {}

  State.prototype.loadImage = function(key) {
    this.load.image(key, 'gfx/' + key + '.png');
  };

  State.prototype.loadSpritesheet = function(key, frameWidth, frameHeight, frameMax, margin, spacing) {
    this.load.spritesheet(key, 'gfx/' + key + '.png', frameWidth, frameHeight, frameMax, margin, spacing);
  };

  State.prototype.loadPlantSpritesheet = function(key) {
    this.load.spritesheet(key, 'gfx/' + key + '.png', 15, 15);
  };

  State.prototype.loadToolSpritesheet = function(key) {
    this.load.spritesheet(key, 'gfx/' + key + '.png', 20, 20);
  }

  State.prototype.createBackground = function(spriteKey) {
    var background = this.add.sprite(this.world.centerX, this.world.centerY, spriteKey || (this.key + 'Background'));
    background.anchor.setTo(0.5, 0.5);
    background.scale.setTo(2, 2);
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
    this.loadImage('PreloadBackground');
    this.loadImage('PreloadBar');
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
    this.loadSpritesheet('LevelSelectLevel', 30, 30);
    this.loadSpritesheet('Player', 15, 15);
    this.loadSpritesheet('ActiveToolMarker', 24, 24);
    this.load.json('levels', 'levels.json?' + new Date());
  };

  Preload.prototype.create = function() {
    var levels = new Levels(this.cache.getJSON('levels'));
    this.state.start('SelectLevel', CLEAR_WORLD, !CLEAR_CACHE, levels);
  };

  SelectLevel.prototype.init = function(levels) {
    this.levels = levels;
  };

  SelectLevel.prototype.create = function() {
    this.createBackground();
    this.levelSprites = this.levels.available().map(this.createLevelSprite, this);
    this.levelInfoText = this.add.text(320, 380, '', LEVEL_INFO_STYLE);
    this.levelInfoText.anchor.setTo(0.5, 1);
    this.levelInfoText.visible = false;
    this.levelNameText = this.add.text(320, 0, '', LEVEL_NAME_STYLE);
    this.levelNameText.anchor.setTo(0, 1);
    this.levelNameText.visible = false;
    this.startLevelText = this.add.text(320, 380, 'Start!', LEVEL_START_STYLE);
    this.startLevelText.anchor.setTo(0.5, 0);
    this.startLevelText.inputEnabled = true;
    this.startLevelText.events.onInputOver.add(this.highlightStartLevelText, this);
    this.startLevelText.events.onInputOut.add(this.unhighlightStartLevelText, this);
    this.startLevelText.events.onInputDown.add(this.startLevel, this);
    this.startLevelText.visible = false;
    this.currentLevelKey = null;
  };

  SelectLevel.prototype.createLevelSprite = function(level) {
    var spriteFrame = 0;
    if (level.finished) {
      spriteFrame = 2;
    } else if (level.unlocksSomeOtherLevel) {
      spriteFrame = 1;
    }
    var sprite = this.add.sprite(level.x, level.y, 'LevelSelectLevel', spriteFrame);
    sprite.anchor.setTo(0.5, 0.5);
    sprite.inputEnabled = true;
    sprite.events.onInputUp.add(this.showLevelInfo, this, 0, level.key, level.name, level.shortDescription);
    return sprite;
  };

  SelectLevel.prototype.showLevelInfo = function(sprite, pointer, $, levelKey, name, info) {
    this.levelInfoText.setText(info);
    this.levelInfoText.visible = true;
    this.levelNameText.setText(name);
    this.startLevelText.visible = true;
    this.levelNameText.visible = true;
    this.currentLevelKey = levelKey;
    var textBounds = this.levelInfoText.getBounds();
    this.levelNameText.position.setTo(textBounds.x, textBounds.y);
  };

  SelectLevel.prototype.highlightStartLevelText = function() {
    this.startLevelText.setStyle(LEVEL_START_STYLE_HOVER);
  };

  SelectLevel.prototype.unhighlightStartLevelText = function() {
    this.startLevelText.setStyle(LEVEL_START_STYLE);
  };

  SelectLevel.prototype.startLevel = function() {
    this.state.start('Play', CLEAR_WORLD, !CLEAR_CACHE, this.levels.byKey(this.currentLevelKey));
  };

  Play.prototype.init = function(level) {
    this.level = level;
    this.rotation = 0;
    this.createBackground('PlayBackgroundBlue');
  };

  Play.prototype.create = function() {
    this.addPlanet();
    this.addPlayer();
    this.addPlants();
    this.addActiveToolMarker();
    this.addTools();
    this.bindKeys();
  };

  Play.prototype.addPlanet = function() {
    this.planet = this.add.sprite(200, 200, 'Planet1');
    this.planet.anchor.setTo(0.5, 0.5);
    this.planet.scale.setTo(2, 2);
  };

  Play.prototype.addPlayer = function() {
    this.player = this.add.sprite(200, 25, 'Player');
    this.player.anchor.setTo(0.5, 0);
    this.player.scale.setTo(2, 2);
    this.player.animations.add('run', ALL_FRAMES, ANIMATION_FPS, LOOP_ANIMATION);
    this.player.play('run');
  };

  Play.prototype.addActiveToolMarker = function() {
    this.activeToolMarker = this.add.sprite(440, 16, 'ActiveToolMarker');
    this.activeToolMarker.anchor.setTo(0.5, 0);
    this.activeToolMarker.scale.setTo(2, 2);
    this.activeToolMarker.animations.add('normal', ALL_FRAMES, ANIMATION_FPS, LOOP_ANIMATION);
    this.activeToolMarker.play('normal');
  };

  Play.prototype.addTools = function() {
    this.tools = this.level.tools.map(
      function (toolData) {
        var sprite = this.add.sprite(0, 0, toolData.key.replace(/-([0-9]+)$/, 'Tool'), toolData.key.replace(/^.*-([0-9]+)$/, '$1')-1);
        _.extend(sprite, toolData);
        sprite.anchor.setTo(0.5, 0);
        sprite.scale.setTo(2, 2);
        return sprite;
      },
      this
    );
    this.currentToolIndex = 0;
    this.tools.some(function(tool) {
        if (tool.key === this.level.firstTool) {
          return true;
        } else {
          this.currentToolIndex++;
        }
      },
      this
    );
    this.positionTools();
  };

  Play.prototype.positionTools = function() {
    this.tools.forEach(
      function(tool, index, tools) {
        var visibleIndex = (index - this.currentToolIndex + tools.length) % tools.length;
        tool.position.setTo(440, visibleIndex * 50 + 20);
      },
      this
    );
  };

  Play.prototype.addPlants = function() {
    this.plants = _.flatten(
      this.level.plantTypes.map(
        function (type) {
          if (!this.level.plants[type.key]) {
            return [];
          }
          return this.level.plants[type.key].map(_.bind(this.createPlant, this, type.key));
        },
        this
      )
    );
  };

  Play.prototype.createPlant = function(type, position) {
    var frameIndex = 2*type.replace(/^.*-([0-9]+)$/, '$1')-1;
    var spriteKey = type.replace(/-([0-9]+)$/, 'Plant');
    var sprite = this.add.sprite(0, 0, spriteKey);
    sprite.anchor.setTo(0.5, 0.5);
    sprite.scale.setTo(2, 2);
    sprite.baseRotation = position;
    var animation = sprite.animations.add('stand', [frameIndex-1, frameIndex], ANIMATION_FPS, LOOP_ANIMATION);
    sprite.play('stand');

    // Avoid synchronized animations.
    var animationOffset = Math.floor(Math.random() * animation.delay);
    animation._timeNextFrame += animationOffset;
    animation._timeLastFrame += animationOffset;

    sprite.movePlant = movePlant;
    sprite.movePlant(0);
    return sprite;
  };

  function movePlant(rotation)
  {
    this.rotation = this.baseRotation - rotation;
    this.position.setTo(
      200 - PLANT_DISTANCE * Math.sin(-this.rotation),
      200 - PLANT_DISTANCE * Math.cos(-this.rotation)
    );
  }

  Play.prototype.bindKeys = function() {
    var keyCodeForA = 65;
    var keyCodeForS = 83;
    this.input.keyboard.addKey(keyCodeForA).onUp.add(this.switchTool, this);
    this.input.keyboard.addKey(keyCodeForS).onUp.add(this.useTool, this);
  };

  Play.prototype.switchTool = function() {
    this.currentToolIndex = (this.currentToolIndex + 1) % this.tools.length;
    this.positionTools();
  };

  Play.prototype.useTool = function() {
  };

  Play.prototype.update = function() {
    this.rotation += 0.01;
    this.planet.rotation = -this.rotation;
    this.plants.forEach(_.method('movePlant', this.rotation));
  }

  ShowLevelResult.prototype.update = function() {}

  /*
  * All levels.
  */
  function Levels(data) {
    this.data = data;
    this.levels = data.levels.map(this.dataToLevel, this);
  }

  Levels.prototype.available = function() {
    return this.levels.filter(_.property('unlocked'));
  };

  Levels.prototype.dataToLevel = function (data) {
    var level = new Level(data);
    level.unlocksSomeOtherLevel = level.unlocks.some(function(levelKey){
      return this.data.levels.some(function(levelData) {
        return !levelData.unlocked && levelData.key === levelKey
      });
    }, this);
    return level;
  }

  Levels.prototype.byKey = function (key) {
    return this.levels.find(function(level) {
      return level.key === key;
    });
  };

  /*
  * A single level.
  */
  function Level(data)
  {
    _.extend(this, data);

    // Ensure booleans
    this.unlocked = !!this.unlocked;
    this.finished = !!this.finished;

    // Must be array
    this.unlocks = Array.isArray(this.unlocks) ? this.unlocks : [];
  }

  var PRELOAD_IMAGES = [
    'InvisiblePlant',
    'PlayBackgroundBlue',
    'SelectLevelBackground',
    'Planet1'
  ];

  var PLANT_SPRITESHEETS = [
    'TutorialPlant'
  ];

  var TOOL_SPRITESHEETS = [
    'TutorialTool'
  ];

  return myGame;

})(_, Phaser);
