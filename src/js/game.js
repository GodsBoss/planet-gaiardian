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
  var TOOL_STYLE = {
    fill: '#aaaaaa',
    font: 'normal 20px monospace'
  };
  var CURRENT_TOOL_STYLE = {
    fill: '#ffffff',
    font: 'bold 20px monospace'
  };
  var VICTORY_STYLE = {
    fill: '#ccffcc',
    font: 'bold 20px monospace'
  };
  var DEFEAT_STYLE = {
    fill: '#ffcccc',
    font: 'bold 20px monospace'
  };
  var VICTORY_TEXT = 'Victory!';
  var DEFEAT_TEXT = 'You lost!';
  var TIMER_STYLE = {
    fill: '#ffffff',
    font: 'normal 20px monospace'
  };
  var TIMER_STYLE_DANGEROUS = _.merge({}, TIMER_STYLE, { fill: '#ffff00'});
  var TIMER_STYLE_CRITICAL = _.merge({}, TIMER_STYLE, { fill: '#ff0000'});
  var TIMER_DANGEROUS_THRESHOLD = 20;
  var TIMER_CRITICAL_THRESHOLD = 5;
  var VICTORY_CONDITION_STYLE = {
    fill: '#ffffff',
    font: 'normal 12px monospace'
  };
  var VICTORY_CONDITION_STYLE_OK = _.merge({}, VICTORY_CONDITION_STYLE, { fill: '#00ff00' });

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
    this.game.levels = new Levels(this.cache.getJSON('levels'));
    this.state.start('SelectLevel');
  };

  SelectLevel.prototype.create = function() {
    this.createBackground();
    this.levelSprites = this.game.levels.available().map(this.createLevelSprite, this);
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
    this.state.start('Play', CLEAR_WORLD, !CLEAR_CACHE, this.game.levels.byKey(this.currentLevelKey));
  };

  Play.prototype.init = function(level) {
    this.level = level;
    this.rotation = 0;
    this.createBackground(this.level.background);
  };

  Play.prototype.create = function() {
    this.addPlanet();
    this.addPlayer();
    this.plants = new Plants(this, this.level);
    this.tools = new Tools(this, this.level);
    this.addVictoryConditions();
    this.addTimer();
    this.bindKeys();
  };

  Play.prototype.addPlanet = function() {
    this.planet = this.add.sprite(200, 200, this.level.planet);
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
  };

  Play.prototype.useTool = function() {
    this.plants.useTool(this.tools.current());
    this.victoryConditions.show(this.plants);
    if (this.level.isWon(this.plants)) {
      this.state.start('ShowLevelResult', CLEAR_WORLD, !CLEAR_CACHE, this.level, true);
    }
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
    this.game.levels.won(level);
    this.level = level;
    this.victorious = victorious;
  };

  ShowLevelResult.prototype.create = function() {
    this.createBackground('PlayBackgroundBlue');
    this.addPlanet();
    this.addTitle();
    this.addOkButton();
  };

  ShowLevelResult.prototype.addTitle = function() {
    this.title = this.add.text(10, 10, this.victorious ? VICTORY_TEXT : DEFEAT_TEXT);
    this.title.anchor.setTo(0, 0);
    this.title.scale.setTo(2, 2);
    this.title.setStyle(this.victorious ? VICTORY_STYLE : DEFEAT_STYLE);
  };

  ShowLevelResult.prototype.addOkButton = function() {
    this.button = this.add.text(10, 390, 'Back to level selection');
    this.button.anchor.setTo(0, 1);
    this.button.scale.setTo(2, 2);
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

  Levels.prototype.won = function(beatenLevel) {
    beatenLevel.unlocksSomeOtherLevel = false;
    this.levels.filter(function(level) {
      return _.includes(beatenLevel.unlocks, level.key)
    }).forEach(function(level) { level.unlocked = true; });
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

  Level.prototype.isWon = function(plants) {
    return _.every(
      this.victory.normal,
      function(countNeeded, type){
        return plants.hasAtLeast(type, countNeeded);
      }
    );
  };

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

  /*
  * All plants a level contains.
  */
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

  Plants.prototype.current = function() {
    return this.plants.find(_.method('isCurrent'));
  };

  Plants.prototype.useTool = function(tool) {
    var currentPlant = this.current();
    if (currentPlant) {
      tool.use(currentPlant);
    }
  };

  Plants.prototype.hasAtLeast = function(type, count) {
    return this.counts[type] >= count;
  };

  Plants.prototype.amountByType = function(type) {
    return this.counts[type];
  };

  /*
  * A single plant.
  */
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

  /*
  * All the tools available in the current level.
  */
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
    this.current().setActive();
    this.positionTools();
    this.activeToolMarker = state.add.sprite(400, 30, 'ActiveToolMarker');
    this.activeToolMarker.anchor.setTo(0.5, 0.5);
    this.activeToolMarker.scale.setTo(2, 2);
    this.activeToolMarker.animations.add('normal', ALL_FRAMES, ANIMATION_FPS, LOOP_ANIMATION);
    this.activeToolMarker.play('normal');
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
    this.current().setInactive();
    this.currentToolIndex = (this.currentToolIndex + 1) % this.tools.length;
    this.current().setActive();
    this.positionTools();
  };

  /*
  * A single tool.
  */
  function Tool(tools, state, data) {
    this.tools = tools;
    _.extend(this, data);
    this.amount = _.isFinite(this.amount) ? this.amount : +Infinity;
    var spriteInfo = splitType(data.key, 'Tool', 1);
    this.sprite = state.add.sprite(0, 0, spriteInfo.spriteKey, spriteInfo.frameIndex);
    this.sprite.anchor.setTo(0.5, 0.5);
    this.sprite.scale.setTo(2, 2);
    this.text = state.add.text(0, 0, '', TOOL_STYLE);
    this.text.anchor.setTo(0, 0.5);
    this.showAmount();
  }

  Tool.prototype.setVisibleIndex = function(index) {
    var y = index * 50 + 30;
    this.sprite.position.setTo(400, y);
    this.text.position.setTo(430, y + 4); // For some reason, an offset is needed to look good.
  };

  Tool.prototype.use = function(plant) {
    if (this.amount > 0 && this.convert[plant.type]) {
      this.amount--;
      this.showAmount();
      plant.convertTypeTo(this.convert[plant.type]);
    }
  };

  Tool.prototype.showAmount = function() {
    this.text.setText(_.isFinite(this.amount) ? this.amount : '∞');
  };

  Tool.prototype.setActive = function() {
    this.text.setStyle(CURRENT_TOOL_STYLE);
  };

  Tool.prototype.setInactive = function() {
    this.text.setStyle(TOOL_STYLE);
  };

  /*
  * For time-critical missions.
  */
  function Timer(state, time) {
    if (!_.isFinite(time)) {
      this.time = Infinity;
      return this;
    }
    this.time = time;
    this.text = state.add.text(10, 10, '', TIMER_STYLE);
    this.text.anchor.setTo(0, 0);
    this.updateTime();
    state.time.events.repeat(1000, Infinity, this.tick, this);
  }

  Timer.prototype.updateTime = function() {
    this.text.setText(this.time);
    if (this.time <= TIMER_DANGEROUS_THRESHOLD) {
      this.text.setStyle(TIMER_STYLE_DANGEROUS);
    }
    if (this.time <= TIMER_CRITICAL_THRESHOLD) {
      this.text.setStyle(TIMER_STYLE_CRITICAL);
    }
  };

  Timer.prototype.tick = function() {
    this.time = Math.max(this.time - 1, 0);
    this.updateTime();
  };

  Timer.prototype.timeIsUp = function() {
    return this.time <= 0;
  };

  function VictoryConditions(state, level) {
    var index = 0;
    this.conditions = _.map(
      level.victory.normal,
      function (amount, type) {
        return new VictoryCondition(state, index++, type, amount);
      }
    );
  }

  VictoryConditions.prototype.show = function(plants) {
    this.conditions.forEach(_.method('show', plants));
  };

  function VictoryCondition(state, index, type, neededAmount) {
    this.type = type;
    this.neededAmount = neededAmount;
    var spriteInfo = splitType(type, 'Plant', 2);
    this.sprite = state.add.sprite(100 * index + 10, 390, spriteInfo.spriteKey);
    this.sprite.anchor.setTo(0, 1);
    this.sprite.scale.setTo(2, 2);
    this.sprite.animations.add('stand', [spriteInfo.frameIndex-1, spriteInfo.frameIndex], ANIMATION_FPS, LOOP_ANIMATION);
    this.sprite.play('stand');
    this.text = state.add.text(100 * index + 40, 375, '0 / ' + this.neededAmount, VICTORY_CONDITION_STYLE);
    this.sprite.anchor.setTo(0, 1);
  }

  VictoryCondition.prototype.show = function(plants) {
    var amount = plants.amountByType(this.type);
    this.text.setText(amount + ' / ' + this.neededAmount);
    if (amount >= this.neededAmount) {
      this.text.setStyle(VICTORY_CONDITION_STYLE_OK);
    } else {
      this.text.setStyle(VICTORY_CONDITION_STYLE);
    }
  };

  var PRELOAD_IMAGES = [
    'InvisiblePlant',
    'PlayBackgroundBlue',
    'SelectLevelBackground',
    'Planet1'
  ];

  var PLANT_SPRITESHEETS = [
    'TutorialPlant',
    'YellowFeverPlant'
  ];

  var TOOL_SPRITESHEETS = [
    'TutorialTool',
    'YellowFeverTool'
  ];

  return myGame;

})(_, Phaser);
