class VictoryCondition {
  constructor(state, index, type, neededAmount) {
    this.type = type;
    this.neededAmount = neededAmount;
    var spriteInfo = splitType(type, 'Plant', 2);
    this.sprite = state.add.sprite(50 * index + 5, 195, spriteInfo.spriteKey);
    this.sprite.anchor.setTo(0, 1);
    this.sprite.animations.add('stand', [spriteInfo.frameIndex-1, spriteInfo.frameIndex], ANIMATION_FPS, LOOP_ANIMATION);
    this.sprite.play('stand');
    this.text = state.add.text(50 * index + 20, 187, '0 / ' + this.neededAmount, VictoryCondition.STYLE);
    this.sprite.anchor.setTo(0, 1);
  }

  show(plants) {
    var amount = plants.amountByType(this.type);
    this.text.setText(amount + ' / ' + this.neededAmount);
    if (amount >= this.neededAmount) {
      this.text.setStyle(VictoryCondition.STYLE_OK);
    } else {
      this.text.setStyle(VictoryCondition.STYLE);
    }
  }
}

VictoryCondition.STYLE = {
  fill: '#ffffff',
  font: 'normal 8px monospace'
};
VictoryCondition.STYLE_OK = _.merge({}, VictoryCondition.STYLE, { fill: '#00ff00' });
