var Deffy = require("deffy")
  , Typpy = require("typpy")
  , Enny = require("enny")
  ;

var SEPARATOR = "_";

function SubElmId(type, name, parent) {

    if (Typpy(type, SubElm)) {
        parent = name;
        name = type.name;
        this.index = type.index;
        type = type.type;
    }

    this.index = Deffy(this.index, 0);
    this.type = type;
    this.name = name;
    this.parentId = parent;
}

SubElmId.prototype.toString = function (noIndex) {
    return [this.type, this.parentId, this.name, noIndex ? "" : this.index].join(SEPARATOR);
};

function SubElm(type, data, parent) {
    if (Typpy(data, SubElm)) {
        return data;
    }
    if (typeof type === "string") {
        type = Enny.TYPES[type];
    }
    this.index = 0;
    if (Typpy(data.index, Number)) {
        this.index = data.index;
    }
    this.icon = type.icon;
    this.name = SubElm.Name(data);
    this.label = Deffy(data.label, this.name);
    this.disableInput = data.disableInput;
    this.type = type.type;
    this.id = new SubElmId(this, parent.id);
    this.lines = {};
}

SubElm.Name = function (input) {
    return input.name || input.event || input.serverMethod || input.method;
};

SubElm.Id = SubElmId;

module.exports = SubElm;
