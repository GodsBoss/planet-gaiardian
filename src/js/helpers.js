var inherit = (function() {
  function F(){}
  return function(parent, child) {
    F.prototype = parent.prototype;
    child.prototype = new F();
  }
})();
