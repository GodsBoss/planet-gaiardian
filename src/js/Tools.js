/*
* All the tools available in the current level.
*/
function Tools(state, level) {
  this.tools = level.tools.map(
    function (toolData) {
      return new Tool(this, state, toolData);
    },
    this
  );
  this.currentToolIndex = 0;
  this.tools.some(function(tool) {
      if (tool.key === level.firstTool) {
        return true;
      } else {
        this.currentToolIndex++;
      }
    },
    this
  );
  this.current().setActive();
  this.positionTools();
  this.activeToolMarker = state.add.sprite(200, 15, 'ActiveToolMarker');
  this.activeToolMarker.anchor.setTo(0.5, 0.5);
  this.activeToolMarker.animations.add('normal', ALL_FRAMES, ANIMATION_FPS, LOOP_ANIMATION);
  this.activeToolMarker.play('normal');
}

Tools.prototype.positionTools = function() {
  this.tools.forEach(
    function(tool, index, tools) {
      tool.setVisibleIndex((index - this.currentToolIndex + tools.length) % tools.length)
    },
    this
  );
};

Tools.prototype.current = function() {
  return this.tools[this.currentToolIndex];
};

Tools.prototype.switch = function() {
  this.current().setInactive();
  this.currentToolIndex = (this.currentToolIndex + 1) % this.tools.length;
  this.current().setActive();
  this.positionTools();
};
