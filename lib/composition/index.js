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

    IterateObject(this.nodes, function (id, node) {
        var cNode = out.nodes[id] = {
            id: node.id.toString(),
            color: node.color,
            domains: node.domains,
            icon: node.icon,
            name: node.label,
            subelms: {}
        };

        IterateObject(node.subelms, function (sid, selm) {
            cNode.subelms[sid] = {
                id: selm.id.toString(),
                label: selm.label,
                type: selm.type,
                icon: selm.icon
            };
        });
    });

    IterateObject(this.lines, function (id, line) {
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
                var source = node.subelms[new SubElm.Id(Enny.TYPES.listener, event, node.name)];
                var target = targetNode.subelms[new SubElm.Id(Enny.convertToOn(comp.type), SubElm.Name(comp), comp.instance)];
                if (!source || !target) {
                    //debugger
                    // TODO Add data handlers
                    return;
                }
                self.connect(source, target);
            });
        });

        //IterateObject(node.subelms, function (id, subelm) {

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

},{"./line":3,"./node":4,"./node/subelm":5,"deffy":7,"enny":8,"iterate-object":13,"typpy":14,"ul":15}],3:[function(require,module,exports){
function Line(input) {
    this.source = input.source;
    this.target = input.target;
    this.id = this.source.id + "_" + this.target.id + "_" + Math.random();
}

module.exports = Line;

},{}],4:[function(require,module,exports){
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

},{"./subelm":5,"deffy":7,"enny":8,"typpy":14}],5:[function(require,module,exports){
var Deffy = require("deffy")
  , Typpy = require("typpy")
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
    this.parentName = parent;
}

SubElmId.prototype.toString = function () {
    return [this.type, this.parentName, this.name].join(SEPARATOR);
};

function SubElm(type, data, parent) {
    if (Typpy(data, SubElm)) {
        return data;
    }
    this.name = SubElm.Name(data);
    this.label = Deffy(data.label, this.name);
    this.type = type;
    this.id = new SubElmId(this, parent.name)
    this.lines = {};
}

SubElm.Name = function (input) {
    return input.name || input.event || input.serverMethod || input.method;
};

SubElm.Id = SubElmId;

module.exports = SubElm;

},{"deffy":7,"typpy":14}],6:[function(require,module,exports){
// Dependencies
var Typpy = require("typpy")
  , NodeElm = require("./composition/node")
  , Composition = require("./composition")
  , Enny = require("enny")
  ;

function Parser(input, appService, moduleInfo, callback) {

    // Add the instances
    var comp = new Composition({
        instances: input
      , appService: appService
      , moduleInfo: moduleInfo
    })

    comp.parseFlow();
    comp.addConnections();

    callback(null, comp);
}

if (typeof window === "object") {
    window.EngineParser = Parser;
}

module.exports = Parser;

},{"./composition":2,"./composition/node":4,"enny":8,"typpy":14}],7:[function(require,module,exports){
// Dependencies
var Typpy = require("typpy");

/**
 * Deffy
 * Computes a final value by providing the input and default values.
 *
 * @name Deffy
 * @function
 * @param {Anything} input The input value.
 * @param {Anything|Function} def The default value or a function getting the
 * input value as first argument.
 * @param {Object|Boolean} options The `empty` value or an object containing
 * the following fields:
 *
 *  - `empty` (Boolean): Handles the input value as empty field (`input || default`). Default is `false`.
 *
 * @return {Anything} The computed value.
 */
function Deffy(input, def, options) {

    // Default is a function
    if (typeof def === "function") {
        return def(input);
    }

    options = Typpy(options) === "boolean" ? {
        empty: options
    } : {
        empty: false
    };

    // Handle empty
    if (options.empty) {
        return input || def;
    }

    // Return input
    if (Typpy(input) === Typpy(def)) {
        return input;
    }

    // Return the default
    return def;
}

module.exports = Deffy;

},{"typpy":14}],8:[function(require,module,exports){
var Ul = require("ul");
var Typpy = require("typpy");
var Deffy = require("deffy");
var IterateObject = require("iterate-object")

const TYPES = {
    // :some/datahandler
    dataHandler: "dataHandler",
    // !some/error-handelr
    errorHandler: "errorHandler",
    // instance/method
    streamHandler: "streamHandler",
    // load
    // TODO
    load: "load",
    // ["instance/emit", "some-event"]
    emit: "emit",
    // ["link", "instance/method"]
    link: "link",
    // "event"
    listener: "listener"
};

function Enny() {
    var self = this;
    self.instances = {};
    self.Instance = function (data) {
        return new Enny.Instance(data, {
            enny: self
        });
    };
    self.FlowComponent = function (data) {
        return new Enny.FlowComponent(data, {
            enny: self
        });
    };
}

Enny.prototype.toJSON = function (a, b, c) {
    var self = this;
    var obj = {};
    Object.keys(self.instances).forEach(function (name) {
        obj[name] = self.instances[name]._;
    });
    return obj;
};

Enny.prototype.addInstance = function (ins) {
    ins = this.Instance(ins);
    this.instances[ins._.name] = ins;
    return ins;
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
                var source = node.subelms[new SubElm.Id(Enny.TYPES.listener, event, node.name)];
                var target = targetNode.subelms[new SubElm.Id(Enny.convertToOn(comp.type), SubElm.Name(comp), comp.instance)];
                if (!source || !target) {
                    //debugger
                    // TODO Add data handlers
                    return;
                }
                self.connect(source, target);
            });
        });

        //IterateObject(node.subelms, function (id, subelm) {

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
