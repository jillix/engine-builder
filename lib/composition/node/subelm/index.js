var Deffy = require("deffy")
  , Typpy = require("typpy")
  , Enny = require("enny")
  ;

var SEPARATOR = "_";

function SubElmId(type, name, parent) {

    if (Typpy(type, SubElm)) {
        parent = name;
        name = type.name;
        type = type.type;
    }

    this.type = type;
    this.name = name;
    this.parentId = parent;
}

SubElmId.prototype.toString = function () {
    return [this.type, this.parentId, this.name].join(SEPARATOR);
};

function SubElm(type, data, parent) {
    if (Typpy(data, SubElm)) {
        return data;
    }
    if (typeof type === "string") {
        type = Enny.TYPES[type];
    }
    this.icon = type.icon;
    this.name = SubElm.Name(data);
    this.label = Deffy(data.label, this.name);
    this.type = type.type;
    this.id = new SubElmId(this, parent.id)
    this.lines = {};
}

SubElm.Name = function (input) {
    return input.name || input.event || input.serverMethod || input.method;
};

SubElm.Id = SubElmId;

module.exports = SubElm;
