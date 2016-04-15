/*
* All plants a level contains.
*/
class Plants {
  constructor(state, level) {
    this.plants = _.flatten(
      level.plantTypes.map(
        (type) =>
          level.plants[type.key] ? level.plants[type.key].map(_.bind(this.createPlant, this, state, type.key)) : []
      )
    );
    this.counts = {};
    level.plantTypes.forEach(
      (plantType) =>
        this.counts[plantType.key] = level.plants[plantType.key] ? level.plants[plantType.key].length : 0
    );
  }

  createPlant(state, type, position) {
    return new Plant(this, state, type, position);
  };

  move(rotation) {
    this.plants.forEach(_.method('move', rotation));
  }

  current() {
    return this.plants.find(_.method('isCurrent'));
  };

  useTool(tool) {
    var currentPlant = this.current();
    if (currentPlant) {
      tool.use(currentPlant);
    }
  };

  hasAtLeast(type, count) {
    return this.counts[type] >= count;
  };

  amountByType(type) {
    return this.counts[type];
  };
}
