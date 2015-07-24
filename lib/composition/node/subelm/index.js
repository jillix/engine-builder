var Deffy = require("deffy")

function SubElm(data, parent) {
    this.name = data.name;
    this.label = Deffy(data.label, this.name);
    this.type = data.type;
    this.id = [this.type, parent.name, this.name].join("_");
}

module.exports = SubElm;
