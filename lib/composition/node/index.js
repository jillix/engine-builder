// Dependencies
var Typpy = require("typpy")
  , Deffy = require("deffy")
  , SubElm = require("./subelm")
  , Enny = require("enny")
  ;

// Constants
var INSTANCE_PREFIX = "inst"
  , SEPARATOR = "_"
  ;

function NodeId(input, isServer) {
    isServer = Deffy(isServer, !!input.isServer);
    this.isServer = isServer;
    this.side = ["Client", "Server"][Number(isServer)];
    this.name = input.name;
}

NodeId.prototype.toString = function () {
    return [INSTANCE_PREFIX, this.side, this.name].join(SEPARATOR);
};

function NodeElm(data, isServer) {
    isServer = Deffy(isServer, false);
    this.id = new NodeId(data, isServer)
    this.icon = Deffy(data.icon, "&#xf0c0");
    this.subelms = {};
    this.label = data.name + " (" + this.id.side + ")";
    this.domains = [];
    this.name = data.name;
    this.flow = Deffy(isServer ? data.flow : (data.client && data.client.flow), []);
    this.pFlow = Enny.instanceFlow(this.flow, this.name);
    this.raw = data;
}

NodeElm.Id = NodeId;

NodeElm.prototype.hasFlow = function () {
    return !!this.flow.length;
};

NodeElm.prototype.setColor = function (c) {
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

NodeElm.prototype.addSubElement = function (type, elm) {
    elm = new SubElm(type, elm, this);
    if (this.subelms[elm.id]) {
        console.warn("Override", elm);
    }
    return this.subelms[elm.id] = elm;
};

module.exports = NodeElm;
