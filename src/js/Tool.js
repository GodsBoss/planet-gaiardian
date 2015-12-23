/*
* A single tool.
*/
function Tool(tools, state, data) {
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

Tool.STYLE = {
  fill: '#aaaaaa',
  font: 'normal 10px monospace'
};

Tool.CURRENT_STYLE = {
  fill: '#ffffff',
  font: 'bold 10px monospace'
};

Tool.prototype.setVisibleIndex = function(index) {
  var y = index * 25 + 16;
  this.sprite.position.setTo(200, y);
  this.text.position.setTo(215, y + 2); // For some reason, an offset is needed to look good.
};

Tool.prototype.use = function(plant) {
  if (this.amount > 0 && this.convert[plant.type]) {
    this.amount--;
    this.showAmount();
    plant.convertTypeTo(this.convert[plant.type]);
  }
};

Tool.prototype.showAmount = function() {
  this.text.setText(_.isFinite(this.amount) ? this.amount : '∞');
};

Tool.prototype.setActive = function() {
  this.text.setStyle(Tool.CURRENT_STYLE);
};

Tool.prototype.setInactive = function() {
  this.text.setStyle(Tool.STYLE);
};
