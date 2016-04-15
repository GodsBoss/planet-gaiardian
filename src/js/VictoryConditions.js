class VictoryConditions {

  constructor(state, level) {
    var index = 0;
    this.conditions = _.map(
      level.victory.normal,
      (amount, type) => new VictoryCondition(state, index++, type, amount)
    );
  }

  show(plants) {
    this.conditions.forEach(_.method('show', plants));
  }
}
