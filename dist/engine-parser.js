(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
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

Enny.Instance = function Instance (data, options) {
    if (Typpy(data) === "instance") {
        return data;
    }
    this._ = Ul.clone(data);
    this.enny = options.enny;
};

Enny.Instance.prototype.connect = function (ins, options, callback) {

    var self = this;
    if (typeof options === "boolean") {
        options = {
            client: options
        };
    } else if (options === "function") {
        callback = options;
        options = {};
    }

    callback = callback || function (err) {
        if (err) { console.error(err); }
    };
    options = Ul.merge(options, {
        client: true
    });
    ins = Enny.Instance(ins, options);

    if (!ins._.name) {
        return callback(new Error("The target instance name is required."));
    }

    if (!self._.name) {
        return callback(new Error("The source instance name is required."));
    }

    var load = null;
    if (options.client) {
        self._.client = Deffy(self._.client, {});
        load = self._.client.load = Deffy(self._.client.load, []);
    } else {
        load = self._.load = Deffy(self._.load, []);
    }
    load.push(ins._.name);
    if (options.save) {
        self.enny.save(callback);
        return self;
    }
    callback();
    return self;
};

Enny.Instance.prototype.addFlow = function (flElm, options, callback) {

    var self = this;
    if (typeof options === "boolean") {
        options = {
            client: options
        };
    } else if (options === "function") {
        callback = options;
        options = {};
    }

    callback = callback || function (err) {
        if (err) { console.error(err); }
    };

    options = Ul.merge(options, {
        client: true
    });

    var flow = null;
    if (options.client) {
        self._.client = Deffy(self._.client, {});
        flow = self._.client.flow = Deffy(self._.client.flow, []);
    } else {
        flow = self._.flow = Deffy(self._.flow, []);
    }

    flElm = new Enny.FlowElement(flElm);

    flow.push(flElm);

    if (options.save) {
        self.enny.save(callback);
        return self;
    }

    callback();
};

Enny.FlowElement = function FlowElement (data) {
    var self = this;
    if (Typpy(data) === "flowelement") {
        return data;
    }
    this._ = [];
    if (Typpy(data) === "array") {
        data.forEach(self.addComponent.bind(self));
    }
};

Enny.FlowElement.prototype.toJSON = function () {
    return this._.map(function (c) {
        return c.toFlow();
    });
};

Enny.FlowElement.prototype.addComponent = function (data) {
    data = new Enny.FlowComponent(data);
    this._.push(data);
};

Enny.FlowElement.prototype.toFlow = function () {
    return this._.map(function (c) {
        return c.toFlow();
    });
};

Enny.Handler = function Handler(data) {
    if (Typpy(data) === "handler") {
        return data;
    }
    this.to = data.to;
    this.args = Deffy(data.args, []);
    this.isStream = Deffy(data.isStream, true);
    this.handler = data.handler;
};

Enny.Handler.prototype.toFlow = function () {
    var res = [];
    res[0] = (this.isStream ? "" : ":") + (this.to ? this.to + "/" : "") + this.handler;
    if (!this.args.length) {
        return res[0];
    }
    res = res.concat(this.args);
    return res;
};

Enny.FlowComponent = function FlowComponent (data) {
    var self = this;
    if (Typpy(data) === "flowcomponent") {
        return data;
    }
    if (data.event) {
        data.type = TYPES.listener;
    }
    self.data = Ul.clone(data);
};

Enny.FlowComponent.prototype.toFlow = function () {
    var data = this.data;
    var res = null;
    switch (data.type) {
        case TYPES.listener:
            if (data.once) {
                return [data.event];
            }
            return data.event;
        case TYPES.dataHandler:
        case TYPES.streamHandler:
            return new Enny.Handler({
                to: data.to,
                isStream: data.type === TYPES.streamHandler,
                args: data.args,
                handler: data.handler
            }).toFlow();
        case TYPES.load:
            return new Enny.Handler({
                args: [[data.instance]],
                handler: TYPES.load
            }).toFlow();
    }
};

// instance/method
// !instance/method
// >instance/method
// :instance/method
// method
Enny.parseMethod = function (input, defaultIns) {
    var output = {
        instance: defaultIns,
        type: TYPES.streamHandler
    };
    switch (input.charAt(0)) {
        case "!":
            output.type = TYPES.errorHandler;
            input = input.substr(1);
            break;
        case ":":
            output.type = TYPES.dataHandler;
            input = input.substr(1);
            break;
        case ">":
            output.disableInput = true;
            input = input.substr(1);
            break;
        default:
            break;
    }
    var splits = input.split("/");
    if (splits.length === 2) {
        output.instance = splits[0];
        output.method = splits[1];
    } else {
        output.method = splits[0];
    }
    return output;
}

Enny.parseFlowComponent = function (_input, instName) {
    var input = Ul.clone(_input);

    if (Typpy(input, String)) {
        input = [input];
    }

    var output = {};
    // Load
    if (input[0] === TYPES.load) {
        output.type = TYPES.load;
        output.args = input.slice(1);
    // Emit
    } else if (Enny.parseMethod(input[0]).method === "emit") {
        output.type = TYPES.emit;
        output.args = input.slice(1).map(function (c) {
            return Enny.parseMethod(c, instName);
        });
    }

    // Stream handler
    if (!output.type) {
        output = Enny.parseMethod(input[0], instName);
        output.args = input.slice(1);
    }

    if (output.method === TYPES.link) {
        output.serverMethod = output.args[0];
    }

    return output;
};

Enny.instanceFlow = function (_input, name) {
    var output = {
        // TODO
        load: {},

        dataHandler: {},
        errorHandler: {},
        streamHandler: {},
        emit: {},
        listener: {}
    };

    if (!_input.length) {
        return output;
    }

    IterateObject(_input, function (i, f) {
        // Collect listeners
        output.listener[f[0]] = {
            event: f[0],
            type: TYPES.listener
        };
        IterateObject(f.slice(1), function (ii, c) {
            c = Enny.parseFlowComponent(c, name);
            if (c.instance !== name) { return; }
            output[c.type][c.method] = c;
        });
    });
    return output;
};

Enny.parseFlow = function (_input, instName) {

    var input = Ul.clone(_input);
    var output = {
        // TODO
        loads: {},
        dataHandlers: {},
        errorHandlers: {},
        streamHandlers: {},
        emits: {},
        listeners: {}
    };

    for (var i = 0; i < input.length; ++i) {
        var comp = input[i];
        var type = Typpy(comp[0])
        if (type !== "string") {
            continue;
        }
        var eventName = comp[0];
        var ev = output._events[eventName] = output._events[eventName] || [];
        ev.push(comp);
        comp.shift();
    }

    var evs = Object.keys(output._events);
    for (var i = 0; i < evs.length; ++i) {
        var cEvent = evs[i];
        var cFlow = output._events[cEvent];
        var cEv = output.events[cEvent] = [];
        for (var ii = 0; ii < cFlow.length; ++ii) {
            var cFlowElement = cFlow[ii];
            var pFlowElement = [];
            for (var iii = 0; iii < cFlowElement.length; ++iii) {
                var cComponent = cFlowElement[iii];
                if (Typpy(cComponent, String)) {
                    cComponent = [cComponent];
                }
                var cElm = {};
                if (cComponent[0] === TYPES.load) {
                    cElm.type = TYPES.load;
                    cElm.args = cComponent.slice(1);
                } else if (Enny.parseMethod(cComponent[0]).method === "emit") {
                    cElm.type = TYPES.emit;
                    cElm.args = cComponent.slice(1).map(function (c) {
                        return Enny.parseMethod(c, instName);
                    });
                }

                if (!cElm.type) {
                    cElm = Enny.parseMethod(cComponent[0], instName);
                    cElm.args = cComponent.slice(1);
                    cElm.type = TYPES.streamHandler;
                }

                pFlowElement.push(cElm);
            }

            cEv.push(pFlowElement);
        }
    }

    var out = [];
    Object.keys(output.events).forEach(function (c) {
        out.push({
            on: c,
            _: output.events[c]
        });
    });

    return out;
};

Enny.convertToOn = function (input) {
    switch (input) {
        case TYPES.streamHandler:
        case TYPES.link:
        case TYPES.emit:
        case TYPES.listener:
            return TYPES.listener;
        default:
            return null;
    }
};

Enny.TYPES = TYPES;

module.exports = Enny;

},{"deffy":9,"iterate-object":13,"typpy":10,"ul":11}],9:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7,"typpy":10}],10:[function(require,module,exports){
/**
 * Typpy
 * Gets the type of the input value or compares it
 * with a provided type.
 *
 * Usage:
 *
 * ```js
 * Typpy({}) // => "object"
 * Typpy(42, Number); // => true
 * Typpy.get([], "array"); => true
 * ```
 *
 * @name Typpy
 * @function
 * @param {Anything} input The input value.
 * @param {Constructor|String} target The target type.
 * It could be a string (e.g. `"array"`) or a
 * constructor (e.g. `Array`).
 * @return {String|Boolean} It returns `true` if the
 * input has the provided type `target` (if was provided),
 * `false` if the input type does *not* have the provided type
 * `target` or the stringified type of the input (always lowercase).
 */
function Typpy(input, target) {
    if (arguments.length === 2) {
        return Typpy.is(input, target);
    }
    return Typpy.get(input, true);
}

/**
 * Typpy.is
 * Checks if the input value has a specified type.
 *
 * @name Typpy.is
 * @function
 * @param {Anything} input The input value.
 * @param {Constructor|String} target The target type.
 * It could be a string (e.g. `"array"`) or a
 * constructor (e.g. `Array`).
 * @return {Boolean} `true`, if the input has the same
 * type with the target or `false` otherwise.
 */
Typpy.is = function (input, target) {
    return Typpy.get(input, typeof target === "string") === target;
};

/**
 * Typpy.get
 * Gets the type of the input value. This is used internally.
 *
 * @name Typpy.get
 * @function
 * @param {Anything} input The input value.
 * @param {Boolean} str A flag to indicate if the return value
 * should be a string or not.
 * @return {Constructor|String} The input value constructor
 * (if any) or the stringified type (always lowercase).
 */
Typpy.get = function (input, str) {

    if (typeof input === "string") {
        return str ? "string" : String;
    }

    if (null === input) {
        return str ? "null" : null;
    }

    if (undefined === input) {
        return str ? "undefined" : undefined;
    }

    if (input !== input) {
        return str ? "nan" : NaN;
    }

    return str ? input.constructor.name.toLowerCase() : input.constructor;
};

module.exports = Typpy;

},{}],11:[function(require,module,exports){
(function (process){
// Dependencies
var Typpy = require("typpy")
  , Deffy = require("deffy")
  ;

// Constructor
function Ul() {}

/**
 * merge
 * One level merge. Faster than `deepMerge`.
 *
 * @name merge
 * @function
 * @param dst {Object} The destination object.
 * @param src {Object} The source object (usually defaults).
 * @return {Object} The result object.
 */
Ul.prototype.merge = function (dst, src, p) {
    var res = {}
      , k = null
      ;

    src = Deffy(src, {});
    dst = Deffy(dst, {});

    for (k in src) { res[k] = src[k]; }
    for (k in dst) {
        if (undefined === dst[k]) {
            continue;
        }
        res[k] = dst[k];
    }

    return res;
};

/**
 * deepMerge
 * Recursively merge the objects from arguments, returning a new object.
 *
 * Usage: `Ul.deepMerge(obj1, obj2, obj3, obj4, ..., objN)`
 *
 * @name deepMerge
 * @function
 * @return {Object} The merged objects.
 */
Ul.prototype.deepMerge = function () {

    var dst = {}
      , src
      , p
      , args = [].splice.call(arguments, 0)
      ;

    while (args.length > 0) {
        src = args.splice(-1)[0];
        if (Typpy(src) !== "object") { continue; }
        for (p in src) {
            if (!src.hasOwnProperty(p)) { continue; }
            if (Typpy(src[p]) === "object") {
                dst[p] = this.deepMerge(src[p], dst[p] || {});
            } else {
                if (src[p] !== undefined) {
                    dst[p] = src[p];
                }
            }
        }
    }

    return dst;
};

/**
 * clone
 * Deep clone of the provided item.
 *
 * @name clone
 * @function
 * @param {Anything} item The item that should be cloned
 * @return {Anything} The cloned object
 */
Ul.prototype.clone = function (item) {

    if (!item) { return item; }
    var self = this
      , types = [Number, String, Boolean]
      , result
      , i
      ;

    types.forEach(function(type) {
        if (item instanceof type) {
            result = type(item);
        }
    });

    if (typeof result == "undefined") {
        if (Array.isArray(item)) {
            result = [];
            item.forEach(function(child, index) {
                result[index] = self.clone(child);
            });
        } else if (typeof item == "object") {
            if (!item.prototype) {
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    result = {};
                    for (i in item) {
                        result[i] = self.clone(item[i]);
                    }
                }
            } else {
                result = item;
            }
        } else {
            result = item;
        }
    }

    return result;
};

/**
 * home
 * Get the home directory path on any platform. The value can be
 * accessed using `Ul.HOME_DIR` too.
 *
 * @name home
 * @function
 * @return {String} The home directory path.
 */
Ul.prototype.HOME_DIR = process.env[(process.platform == "win32") ? "USERPROFILE" : "HOME"];
Ul.prototype.home = function () {
    return this.HOME_DIR;
};

module.exports = new Ul();

}).call(this,require('_process'))
},{"_process":1,"deffy":9,"typpy":12}],12:[function(require,module,exports){
/**
 * Typpy
 * Gets the type of the input value.
 *
 * @name Typpy
 * @function
 * @param {Anything} input The input value.
 * @return {String} The input value type (always lowercase).
 */
function Typpy(input) {

    if (typeof input === "string") {
        return "string";
    }

    if (null === input) {
        return "null";
    }

    if (undefined === input) {
        return "undefined";
    }

    return input.constructor.name.toLowerCase();
}

module.exports = Typpy;

},{}],13:[function(require,module,exports){
/**
 * IterateObject
 * Iterates an object. Note the object field order may differ.
 *
 * @name IterateObject
 * @function
 * @param {Object} obj The input object.
 * @param {Function} fn A function that will be called with the current name and value.
 * @return {Function} The `IterateObject` function.
 */
function IterateObject(obj, fn) {
    Object.keys(obj).forEach(function (k) {
        fn(k, obj[k]);
    });
}

module.exports = IterateObject;

},{}],14:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"dup":10}],15:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"_process":1,"deffy":7,"dup":11,"typpy":16}],16:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12}]},{},[6]);
