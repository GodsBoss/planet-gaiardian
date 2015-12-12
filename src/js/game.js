var game = (function(_, Phaser) {

  var TRANSPARENT = true;
  var ANTIALIASING = true;
  var AUTOSTART = true;
  var CLEAR_WORLD = true;
  var CLEAR_CACHE = true;

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
    this.loadImage('SelectLevelBackground');
    this.loadSpritesheet('LevelSelectLevel', 30, 30);
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
    this.selectedSprite = null;
    this.levelInfoOpen = false;
  };

  SelectLevel.prototype.createLevelSprite = function(level) {
    var spriteFrame = 0;
    if (level.finished) {
      spriteFrame = 2;
    } else if (level.unlocksSomeOtherLevel) {
      spriteFrame = 1;
    }
    var sprite = this.add.sprite(level.x, level.y, 'LevelSelectLevel', spriteFrame);
    sprite.levelKey = level.key;
    sprite.anchor.setTo(0.5, 0.5);
    sprite.inputEnabled = true;
    sprite.events.onInputUp.add(this.showLevelInfo, this);
    return sprite;
  };

  SelectLevel.prototype.showLevelInfo = function(sprite, pointer) {};

  SelectLevel.prototype.update = function() {}

  Play.prototype.update = function() {}

  ShowLevelResult.prototype.update = function() {}

  function Levels(data) {
    this.data = data;
  }

  Levels.prototype.available = function() {
    return this.data.levels.filter(_.property('unlocked')).map(this.dataToLevel, this);
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

  function Level(data)
  {
    _.extend(this, data);

    // Ensure booleans
    this.unlocked = !!this.unlocked;
    this.finished = !!this.finished;

    // Must be array
    this.unlocks = Array.isArray(this.unlocks) ? this.unlocks : [];
  }

  return myGame;

})(_, Phaser);
