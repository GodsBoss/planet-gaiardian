/*
* All the tools available in the current level.
*/
class Tools {
  constructor(state, level) {
    this.tools = level.tools.map(
      (toolData) => new Tool(this, state, toolData)
    );
    this.currentToolIndex = this.tools.findIndex((tool) => tool.key === level.firstTool);
    this.current().setActive();
    this.positionTools();
    this.activeToolMarker = state.add.sprite(200, 15, 'ActiveToolMarker');
    this.activeToolMarker.anchor.setTo(0.5, 0.5);
    this.activeToolMarker.animations.add('normal', ALL_FRAMES, ANIMATION_FPS, LOOP_ANIMATION);
    this.activeToolMarker.play('normal');
  }

  positionTools() {
    this.tools.forEach(
      (tool, index, tools) => tool.setVisibleIndex((index - this.currentToolIndex + tools.length) % tools.length)
    );
  }

  current() {
    return this.tools[this.currentToolIndex];
  }

  switch() {
    this.current().setInactive();
    this.currentToolIndex = (this.currentToolIndex + 1) % this.tools.length;
    this.current().setActive();
    this.positionTools();
  }
}
