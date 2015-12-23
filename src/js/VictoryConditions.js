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
