var NodeElm = require("./node")
  , LineElm = require("./line")
  , Typpy = require("typpy")
  ;

function Composition() {
    this.nodes = {};
    this.lines = {};
    this.ids = {};
}

Composition.prototype.get = function (elm) {
    if (Typpy(elm1, String)) {
        return this.ids[elm];
    }
    return elm;
}

Composition.prototype.addNode = function (node) {
    node = new NodeElm(node);
    return this.nodes[node.id] = this.ids[node.id] = node;
};

Composition.prototype.addLine = function (line) {
    line = new LineElm(line);
    return this.lines[line.id] = this.ids[line.id] = line;
};

Composition.prototype.connect = function (e1, e2) {
    var elm1 = this.get(e1);
    var elm2 = this.get(e2);
    if (!elm1 || !elm2) {
        return console.warn("Missing element", !e1 ? e1 : "", !e2 ? e2 : "");
    }
    return this.addLine({
        source: elm1
      , target: elm2
    });
};

Composition.prototype.prepare = function () {
    return {
        nodes: this.nodes
      , lines: this.lines
    };
};

module.exports = Composition;
