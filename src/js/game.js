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
    this.plants = new Plants(this, this.level);
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
    this.tools = new Tools(this, this.level);
  };

  Play.prototype.bindKeys = function() {
    var keyCodeForA = 65;
    var keyCodeForS = 83;
    this.input.keyboard.addKey(keyCodeForA).onUp.add(this.switchTool, this);
    this.input.keyboard.addKey(keyCodeForS).onUp.add(this.useTool, this);
  };

  Play.prototype.switchTool = function() {
    this.tools.switch();
  };

  Play.prototype.useTool = function() {
    var plant = this.plants.findCurrentPlant();
    if (plant) {
      this.attemptToReplacePlant(plant);
    }
  };

  Play.prototype.attemptToReplacePlant = function(plant) {
    var currentTool = this.tools.current();
    if (currentTool.amount <= 0 || !currentTool.convert[plant.type]) {
      return;
    }
    currentTool.amount--;
    plant.convertTypeTo(currentTool.convert[plant.type]);
  };

  Play.prototype.update = function() {
    this.rotation += 0.01;
    this.planet.rotation = -this.rotation;
    this.plants.move(this.rotation);
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

  function Plants(state, level) {
    this.plants = _.flatten(
      level.plantTypes.map(
        function (type) {
          if (!level.plants[type.key]) {
            return [];
          }
          return level.plants[type.key].map(_.bind(this.createPlant, this, state, type.key));
        },
        this
      )
    );
    this.counts = {};
    level.plantTypes.forEach(
      function (plantType) {
        this.counts[plantType.key] = level.plants[plantType.key] ? level.plants[plantType.key].length : 0;
      },
      this
    );
  }

  Plants.prototype.createPlant = function(state, type, position) {
    return new Plant(this, state, type, position);
  };

  Plants.prototype.move = function(rotation) {
    this.plants.forEach(_.method('move', rotation));
  }

  Plants.prototype.findCurrentPlant = function() {
    return this.plants.find(_.method('isCurrent'));
  };

  function Plant(plants, state, type, position) {
    this.plants = plants;
    this.type = type;
    this.position = position;

    var spriteInfo = splitType(type, 'Plant', 2);
    var frameIndex = spriteInfo.frameIndex;
    var spriteKey = spriteInfo.spriteKey;
    var sprite = state.add.sprite(0, 0, spriteKey);
    sprite.anchor.setTo(0.5, 0.5);
    sprite.scale.setTo(2, 2);
    var animation = sprite.animations.add('stand', [frameIndex-1, frameIndex], ANIMATION_FPS, LOOP_ANIMATION);
    sprite.play('stand');

    // Avoid synchronized animations.
    var animationOffset = Math.floor(Math.random() * animation.delay);
    animation._timeNextFrame += animationOffset;
    animation._timeLastFrame += animationOffset;

    this.sprite = sprite;
    this.move(0);
  }

  Plant.prototype.move = function (rotation) {
    this.sprite.rotation = this.position - rotation;
    this.sprite.position.setTo(
      200 - PLANT_DISTANCE * Math.sin(-this.sprite.rotation),
      200 - PLANT_DISTANCE * Math.cos(-this.sprite.rotation)
    );
  }

  Plant.prototype.convertTypeTo = function (newType) {
    this.plants.counts[this.type]--;
    this.plants.counts[newType]++;
    this.sprite.kill();
    this.type = newType;
    this.sprite.animations.getAnimation('stand').stop();
    this.sprite.animations.getAnimation('stand').destroy();
    var spriteInfo = splitType(this.type, 'Plant', 2);
    this.sprite.key = spriteInfo.spriteKey;
    this.sprite.revive();
    this.sprite.animations.add('stand', [spriteInfo.frameIndex-1, spriteInfo.frameIndex], ANIMATION_FPS, LOOP_ANIMATION);
    this.sprite.play('stand');
  };

  Plant.prototype.isCurrent = function() {
    return Math.abs(this.sprite.rotation % (Math.PI*2)) < 0.13;
  };

  function Tools(state, level) {
    this.tools = level.tools.map(
      function (toolData) {
        return new Tool(this, state, toolData);
      },
      this
    );
    this.currentToolIndex = 0;
    this.tools.some(function(tool) {
        if (tool.key === level.firstTool) {
          return true;
        } else {
          this.currentToolIndex++;
        }
      },
      this
    );
    this.positionTools();
  }

  Tools.prototype.positionTools = function() {
    this.tools.forEach(
      function(tool, index, tools) {
        tool.setVisibleIndex((index - this.currentToolIndex + tools.length) % tools.length)
      },
      this
    );
  };

  Tools.prototype.current = function() {
    return this.tools[this.currentToolIndex];
  };

  Tools.prototype.switch = function() {
    this.currentToolIndex = (this.currentToolIndex + 1) % this.tools.length;
    this.positionTools();
  };

  function Tool(tools, state, data) {
    this.tools = tools;
    _.extend(this, data);
    this.amount = _.isFinite(this.amount) ? this.amount : +Infinity;
    var spriteInfo = splitType(data.key, 'Tool', 1);
    this.sprite = state.add.sprite(0, 0, spriteInfo.spriteKey, spriteInfo.frameIndex);
    this.sprite.anchor.setTo(0.5, 0);
    this.sprite.scale.setTo(2, 2);
  }

  Tool.prototype.setVisibleIndex = function(index) {
    this.sprite.position.setTo(440, index * 50 + 20);
  };

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
