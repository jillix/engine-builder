// Dependencies
var Typpy = require("typpy")
  , Deffy = require("deffy")
  , SubElm = require("./subelm")
  ;

// Constants
var INSTANCE_PREFIX = "inst"
  , SEPARATOR = "_"
  ;

function NodeElm(data) {
    this.id = [INSTANCE_PREFIX, data.name].join(SEPARATOR);
    this.icon = Deffy(data.icon, "&#xf0c0");
    this.subelements = {};
    this.label = data.name;
    this.domains = [];
}

NodeElm.prototype.color = function (c) {
    return this.color = [this.color, c][arguments.length];
};

NodeElm.prototype.position = function (x, y) {
    if (Typpy(x, Number) && Typpy(y, Number)) {
        return this.position({ x: x, y: y });
    }
    if (!Typpy(x, Object) || !Typpy(x.x, Number) || !Typpy(x.y, Number)) {
        return this.pos;
    }
    this.pos = x;
}

NodeElm.prototype.addSubElement = function (elm) {
    elm = new SubElm(elm);
};

module.exports = NodeElm;
