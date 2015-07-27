var NodeElm = require("./node")
  , SubElm = require("./node/subelm")
  , LineElm = require("./line")
  , Typpy = require("typpy")
  , Deffy = require("deffy")
  , IterateObject = require("iterate-object")
  , Ul = require("ul")
  , Enny = require("enny")
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
    if (Typpy(elm, String)) {
        return this.ids[elm];
    }
    if (Typpy(elm, Object)) {
        return this.get(new NodeElm.Id(elm).toString());
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

Composition.prototype.connect = function (s, t) {
    return this.addLine({
        source: s
      , target: t
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

Composition.prototype.parseFlow = function () {
    var self = this;
    IterateObject(self.nodes, function (name, node) {
        if (!node.hasFlow()) { return; }
        // Add listeners
        IterateObject(node.pFlow.listener, function (type, component) {
            node.addSubElement(Enny.TYPES.listener, component);
        });
    });
};

Composition.prototype.addConnections = function () {
    var self = this;

    IterateObject(self.nodes, function (name, node) {
        if (!node.hasFlow()) { return; }

        // Flow elements
        IterateObject(node.flow, function (_, elm) {
            var event = elm[0];
            // Flow components
            IterateObject(elm.slice(1), function (_, comp) {
                comp = Enny.parseFlowComponent(comp, node.name);
                var targetNode = self.get({
                    name: comp.instance,
                    isServer: !!comp.serverMethod
                });
                var source = node.subelements[new SubElm.Id(Enny.TYPES.listener, event, node.name)];
                var target = targetNode.subelements[new SubElm.Id(Enny.convertToOn(comp.type), SubElm.Name(comp), comp.instance)];
                if (!source || !target) {
                    debugger
                    // TODO Add data handlers
                    return;
                }
                self.connect(source, target);
            });
        });

        //IterateObject(node.subelements, function (id, subelm) {

        //});

        //debugger
        //// Stream handlers
        //IterateObject(node.pFlow.streamHandler, function (name, stream) {
        //    debugger;
        //    self.get({ name: node.name, isServer: true });
        //});
    });
};


module.exports = Composition;
