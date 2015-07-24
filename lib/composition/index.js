var NodeElm = require("./node")
  , LineElm = require("./line")
  , Typpy = require("typpy")
  , Deffy = require("deffy")
  ;

function Composition(input) {

    this.nodes = {};
    this.lines = {};

    // Internal caching
    this.ids = {};

    // Store composition data
    this.instances = Deffy(input.instances, {});
    this.colors = Deffy(input.colors, {});
    this.positions = Deffy(input.positions, {});
    this.moduleInfo = Deffy(input.moduleInfo, {});

    // Add the instances
    this.addInstances();
}

Composition.prototype.get = function (elm) {
    if (Typpy(elm1, String)) {
        return this.ids[elm];
    }
    return elm;
};

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

Composition.prototype.addInstance = function (cInstance, isServer) {
    var self = this
      , cColor = null
      , cPos = null
      , cNode = null
      ;

    cNode = self.addNode(cInstance);
    !!(cColor = self.colors[cNode.id]) && cNode.color(cColor);
    !!(cPos = self.positions[cNode.id]) && cNode.position(cPos);

    if (cInstance.flow && !isServer) {
        self.addInstance(cInstance, true);
    }
};

Composition.prototype.addInstances = function (instances) {
    var self = this
      , cColor = null
      , cPos = null
      , cNode = null
      ;

    instances = instances || self.instances;
    Object.keys(instances).forEach(function (cName) {
        self.addInstance(instances[cName]);
    });
};


module.exports = Composition;
