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
