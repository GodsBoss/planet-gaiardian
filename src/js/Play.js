/*
* The actual game. Player can interact and must play to win.
*
* Next state: ShowLevelResult
*/
function Play() {}

inherit(State, Play);

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
