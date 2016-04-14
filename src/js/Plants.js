/*
* All plants a level contains.
*/
class Plants {
  constructor(state, level) {
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
