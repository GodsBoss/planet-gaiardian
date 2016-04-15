/*
* All levels.
*/
class Levels {

  constructor(data) {
    this.data = data;
    this.levels = data.levels.map(this.dataToLevel, this);
  }

  available() {
    return this.levels.filter(_.property('unlocked'));
  };

  dataToLevel(data) {
    var level = new Level(data);
    level.unlocksSomeOtherLevel = level.unlocks.some((levelKey) =>
      this.data.levels.some((levelData) =>
        !levelData.unlocked && levelData.key === levelKey
      )
    );
    return level;
  }

  byKey(key) {
    return this.levels.find(function(level) {
      return level.key === key;
    });
  };

  won(beatenLevel) {
    beatenLevel.unlocksSomeOtherLevel = false;
    this.levels.filter((level) =>
      _.includes(beatenLevel.unlocks, level.key)
    ).forEach(function(level) { level.unlocked = true; });
  };
}
