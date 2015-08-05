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
    if (Typpy(line.source, SubElm)) {
        line.source.lines[line.id] = line;
    }
    return this.lines[line.id] = this.ids[line.id] = line;
};

Composition.prototype.connect = function (s, t) {
    return this.addLine({
        source: s
      , target: t
    });
};

Composition.prototype.prepare = function () {
    var out = {
        nodes: {}
      , lines: {}
    };

    IterateObject(this.nodes, function (node, id) {
        var cNode = out.nodes[id] = {
            id: node.id.toString(),
            color: node.color,
            domains: node.domains,
            icon: node.icon,
            name: node.label,
            subelms: {},
            pos: node.pos
        };

        IterateObject(node.subelms, function (selm, sid) {
            cNode.subelms[sid] = {
                id: selm.id.toString(),
                label: selm.label,
                type: selm.type,
                icon: selm.icon
            };
        });
    });

    IterateObject(this.lines, function (line, id) {
        out.lines[id] = {
            source: line.source.id.toString(),
            target: line.target.id.toString(),
            id: line.id.toString()
        };
    });

    return out;
};

Composition.prototype.addModuleFlow = function (inst) {
    var mod = null;

    inst = Ul.deepMerge(inst, {
        client: {
            flow: []
        }
      , flow: []
    });


    var composition = null;

    if (Typpy(inst.module, Object)) {
        composition = Ul.deepMerge(inst.module, {
            client: {
                flow: []
            },
            flow: []
        });
    } else {
        if (!Typpy(mod = this.moduleInfo[inst.module], Object)) {
            return inst;
        }
        composition = mod.package.composition;
    }

    inst.flow = composition.flow.concat(inst.flow);
    inst.client.flow = composition.client.flow.concat(inst.client.flow);
    return inst;
};

Composition.prototype.addInstance = function (cInstance, isServer) {
    var self = this
      , info = null
      , cNode = null
      ;

    cNode = self.addNode(cInstance, isServer);
    info = self.appService.e[cNode.name];

    if (info) {
        if (info.color) {
            cNode.setColor(info.color);
        }
        if (info.pos) {
            cNode.position(info.pos);
        }
    }

    if (cInstance.flow && cInstance.flow.length && !isServer) {
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
    IterateObject(instances, function (cInstance) {
        self.addInstance(self.addModuleFlow(Ul.clone(cInstance)));
    });
};

Composition.prototype.parseFlow = function () {
    var self = this;
    IterateObject(self.nodes, function (node) {
        if (!node.hasFlow()) { return; }
        // Add listeners
        IterateObject(node.pFlow, function (_, name) {
            node.addSubElement(Enny.TYPES.listener.name, {
                event: name
            });
        });
    });
};

Composition.prototype.addConnections = function () {

    var self = this;

    // Iterate nodes
    IterateObject(self.nodes, function (node) {

        IterateObject(node.load, function (target) {
            var tNode = self.get({
                name: target,
                isServer: node.id.isServer
            });
            self.connect(node, tNode);
        });

        // Iterate listeners
        IterateObject(node.pFlow, function (flow, event) {

            var listenerBubble = node.getOrAddSubElm(Enny.TYPES.listener.name, {
                event: event
            });

            // Each flow element
            IterateObject(flow, function (elm) {

                //var targetNode = node;
                var handlers = {
                    error: [],
                    data: []
                };

                var streams = [];

                var lastStreamElm = listenerBubble;
                var firstListener = listenerBubble;
                var lastConnectedElm = firstListener;

                if (!lastStreamElm) debugger
                streams.push(lastStreamElm);

                // Each flow component
                IterateObject(elm, function (comp, compIndex, comps) {
                    var targetNode = null;
                    if (Enny.TYPES(comp, Enny.TYPES.load)) {
                        IterateObject(comp.args[0], function (cLoad) {
                            targetNode = self.get({
                                name: cLoad,
                                isServer: node.id.isServer
                            });
                            self.connect(listenerBubble, targetNode);
                        });
                        return;
                    }
                    targetNode = self.get({
                        name: comp.instance,
                        isServer: !!comp.serverMethod || node.id.isServer
                    });
                    var targetSubElm = targetNode.getOrAddSubElm(
                        Enny.convertToOn(comp),
                        comp
                    );
                    if (!targetSubElm) {
                        console.warn("Cannot found the target element", comp);
                        debugger
                        return;
                    }
                    var fElm = lastStreamElm;

                    function handleDataHandlers(c, i, a) {

                        var tmpTargetNode = self.get({
                            name: c.instance,
                            isServer: node.id.isServer
                        });

                        var cTarget = tmpTargetNode.getOrAddSubElm(
                            Enny.convertToOn(c),
                            c
                        );

                        self.connect(fElm, cTarget);
                        fElm = lastConnectedElm = cTarget;

                        if (i === a.length - 1 && targetSubElm !== lastConnectedElm) {
                            self.connect(lastConnectedElm, targetSubElm);
                        }
                    }

                    function createDataAndErrorHandlers() {
                        fElm = lastStreamElm;
                        IterateObject(handlers.data, handleDataHandlers);

                        fElm = lastStreamElm;
                        IterateObject(handlers.error, handleDataHandlers);

                        fElm = lastConnectedElm = targetSubElm;
                        fElm = lastStreamElm = targetSubElm;
                    }

                    switch (comp.type) {
                        case Enny.TYPES.streamHandler.type:
                        case Enny.TYPES.emit.type:
                            if (handlers.data.length || handlers.error.length) {
                                createDataAndErrorHandlers();
                            } else {
                                self.connect(lastStreamElm, targetSubElm);
                            }
                            return;
                        case Enny.TYPES.dataHandler.type:
                        case Enny.TYPES.errorHandler.type:
                            handlers[["error", "data"][Number(Enny.TYPES(comp, Enny.TYPES.dataHandler))]].push(comp);
                            break;
                    }

                    if (compIndex === comps.length - 1) {
                        createDataAndErrorHandlers();
                    }
                });
            });
        });
    });
};


module.exports = Composition;
