/*
* For time-critical missions.
*/
function Timer(state, time) {
  if (!_.isFinite(time)) {
    this.time = Infinity;
    return this;
  }
  this.time = time;
  this.text = state.add.text(5, 5, '', Timer.STYLE);
  this.text.anchor.setTo(0, 0);
  this.updateTime();
  state.time.events.repeat(1000, Infinity, this.tick, this);
}

Timer.STYLE = {
  fill: '#ffffff',
  font: 'normal 10px monospace'
};
Timer.STYLE_DANGEROUS = _.merge({}, Timer.STYLE, { fill: '#ffff00'});
Timer.STYLE_CRITICAL = _.merge({}, Timer.STYLE, { fill: '#ff0000'});
Timer.DANGEROUS_THRESHOLD = 20;
Timer.CRITICAL_THRESHOLD = 5;

Timer.prototype.updateTime = function() {
  this.text.setText(this.time);
  if (this.time <= Timer.DANGEROUS_THRESHOLD) {
    this.text.setStyle(Timer.STYLE_DANGEROUS);
  }
  if (this.time <= Timer.CRITICAL_THRESHOLD) {
    this.text.setStyle(Timer.STYLE_CRITICAL);
  }
};

Timer.prototype.tick = function() {
  this.time = Math.max(this.time - 1, 0);
  this.updateTime();
};

Timer.prototype.timeIsUp = function() {
  return this.time <= 0;
};
