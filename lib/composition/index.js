var NodeElm = require("./node")
  , LineElm = require("./line")
  , Typpy = require("typpy")
  , Deffy = require("deffy")
  , IterateObject = require("iterate-object")
  , Ul = require("ul")
  ;

function Composition(input) {

    this.nodes = {};
    this.lines = {};

    // Internal caching
    this.ids = {};

    // Store composition data
    this.instances = Deffy(input.instances, {});
    this.moduleInfo = Deffy(input.moduleInfo, {});
    this.appService = Deffy(input.appService, {});

    // Add the instances
    this.addInstances();
}

Composition.prototype.get = function (elm) {
    if (Typpy(elm1, String)) {
        return this.ids[elm];
    }
    return elm;
};

Composition.prototype.addNode = function (node, isServer) {
    node = new NodeElm(node, isServer);
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

Composition.prototype.addModuleFlow = function (inst) {
    var mod = null;
    if (!Typpy(inst.module, String) || !Typpy(mod = this.moduleInfo[inst.module], Object)) {
        return inst;
    }
    inst = Ul.deepMerge(inst, {
        client: {
            flow: []
        }
      , flow: []
    });
    var composition = mod.package.composition;
    inst.flow = composition.flow.concat(inst.flow);
    inst.client.flow = composition.client.flow.concat(inst.client.flow);
    return inst;
};

Composition.prototype.addInstance = function (cInstance, isServer) {
    var self = this
      , cColor = null
      , cPos = null
      , cNode = null
      ;

    cNode = self.addNode(cInstance, isServer);

    !!(cColor = self.appService[cNode.name]) && cColor.color && cNode.color(cColor.color);
    !!(cPos = self.appService[cNode.name]) && cPos.pos && cNode.position(cPos.pos);

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
    IterateObject(instances, function (name, cInstance) {
        self.addInstance(self.addModuleFlow(Ul.clone(cInstance)));
    });
};

Composition.prototype.parseClientFlow = function () {
    var self = this;
    IterateObject(self.nodes, function (name, node) {
        if (!node.hasFlow()) { return; }
        IterateObject(node.pFlow, function (type, flowElm) {
            IterateObject(flowElm, function (name, component) {
                node.addSubElement(type, component);
            });
        });
    });
};

module.exports = Composition;
