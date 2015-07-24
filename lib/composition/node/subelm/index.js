var Deffy = require("deffy")
  , Typpy = require("typpy")
  ;

function SubElm(type, data, parent) {
    if (Typpy(data, SubElm)) {
        return data;
    }
    this.name = data.name || data.event || data.method;
    this.label = Deffy(data.label, this.name);
    this.type = type;
    this.id = [this.type, parent.name, this.name].join("_");
}

module.exports = SubElm;
