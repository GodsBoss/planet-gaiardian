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
