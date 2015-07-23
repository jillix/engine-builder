var Typpy = require("typpy");

var INSTANCE_PREFIX = "inst"
  , SEPARATOR = "_"
  ;

function NodeElm(data) {
    this.id = [INSTANCE_PREFIX, data.name].join(SEPARATOR);
}

NodeElm.prototype.color = function (c) {
    return this.color = [this.color, c][arguments.length];
};

NodeElm.prototype.position = function (x, y) {
    if (Typpy(x, Number) && Typpy(y, Number)) {
        return this.position({ x: x, y: y });
    }
    return this.pos = [this.pos, x][arguments.length]
}

module.exports = NodeElm;
