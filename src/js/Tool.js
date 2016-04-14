/*
* A single tool.
*/
class Tool {
  constructor(tools, state, data) {
    this.tools = tools;
    _.extend(this, data);
    this.amount = _.isFinite(this.amount) ? this.amount : +Infinity;
    var spriteInfo = splitType(data.key, 'Tool', 1);
    this.sprite = state.add.sprite(0, 0, spriteInfo.spriteKey, spriteInfo.frameIndex);
    this.sprite.anchor.setTo(0.5, 0.5);
    this.text = state.add.text(0, 0, '', Tool.STYLE);
    this.text.anchor.setTo(0, 0.5);
    this.showAmount();
  }

  setVisibleIndex(index) {
    var y = index * 25 + 16;
    this.sprite.position.setTo(200, y);
    this.text.position.setTo(215, y + 2); // For some reason, an offset is needed to look good.
  }

  use(plant) {
    if (this.amount > 0 && this.convert[plant.type]) {
      this.amount--;
      this.showAmount();
      plant.convertTypeTo(this.convert[plant.type]);
    }
  }

  showAmount() {
    this.text.setText(_.isFinite(this.amount) ? this.amount : '∞');
  }

  setActive() {
    this.text.setStyle(Tool.CURRENT_STYLE);
  }

  setInactive() {
    this.text.setStyle(Tool.STYLE);
  }
}

Tool.STYLE = {
  fill: '#aaaaaa',
  font: 'normal 10px monospace'
};

Tool.CURRENT_STYLE = {
  fill: '#ffffff',
  font: 'bold 10px monospace'
};
