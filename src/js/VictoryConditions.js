class VictoryConditions {

  constructor(state, level) {
    var index = 0;
    this.conditions = _.map(
      level.victory.normal,
      function (amount, type) {
        return new VictoryCondition(state, index++, type, amount);
      }
    );
  }

  show(plants) {
    this.conditions.forEach(_.method('show', plants));
  }
}
