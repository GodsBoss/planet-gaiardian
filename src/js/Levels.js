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
