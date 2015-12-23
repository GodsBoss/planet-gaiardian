/*
* Shown after a level is over.
*
* Next state: SelectLevel
*/
function ShowLevelResult() {}

inherit(State, ShowLevelResult);

ShowLevelResult.VICTORY_STYLE = {
  fill: '#ccffcc',
  font: 'bold 10px monospace'
};
ShowLevelResult.DEFEAT_STYLE = {
  fill: '#ffcccc',
  font: 'bold 10px monospace'
};
ShowLevelResult.VICTORY_TEXT = 'Victory!';
ShowLevelResult.DEFEAT_TEXT = 'You lost!';

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
  this.title = this.add.text(5, 10, this.victorious ? ShowLevelResult.VICTORY_TEXT : ShowLevelResult.DEFEAT_TEXT);
  this.title.anchor.setTo(0, 0);
  this.title.setStyle(this.victorious ? ShowLevelResult.VICTORY_STYLE : ShowLevelResult.DEFEAT_STYLE);
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

ShowLevelResult.prototype.update = function() {};
