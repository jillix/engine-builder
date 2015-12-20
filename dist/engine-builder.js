(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":3}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
"use strict";

// Dependencies
const NodeElm = require("./node")
    , SubElm = require("./node/subelm")
    , SubElmId = require("./node/subelm/id")
    , NodeId = require("./node/id")
    , LineElm = require("./line")
    , typpy = require("typpy")
    , deffy = require("deffy")
    , iterateObject = require("iterate-object")
    , ul = require("ul")
    , flatColors = require("flat-colors").colors
    , numberly = require("numberly")
    ;

class Graph {
    /**
     * Graph
     * Creates a new `Graph` instance.
     *
     * @name Graph
     * @function
     * @param {Object} input An object containing the following fields:
     *
     *   - `instances` (Object): The application instances.
     *   - `moduleInfo` (Object): Module related information.
     *   - `appService` (Object): Application service content (parsed).
     *
     * @return {Graph} The `Graph` instance.
     */
    constructor (input) {

        this.nodes = {};
        this.lines = {};

        // Internal caching
        this.ids = {};

        // Store composition data
        this.instances = deffy(input.instances, {});
        this.moduleInfo = deffy(input.moduleInfo, {});
        this.appService = deffy(input.appService, {});

        // Add the instances
        this.addInstances();
        this.addSubelms();
        this.addLines();
    }

    /**
     * addNode
     * Adds a new element.
     *
     * @name addNode
     * @function
     * @param {Element|Object} node The new element to add.
     * @return {Element} The added element.
     */
    addNode (node) {
        node = new NodeElm(node);
        return (this.nodes[node.id] = this.ids[node.id] = node);
    }

    /**
     * addLine
     * Adds a new line.
     *
     * @name addLine
     * @function
     * @param {Line|Object} line The line to add.
     * @return {Line} The added line.
     */
    addLine (line) {
        line = new LineElm(line);
        if (typpy(line.source, SubElm)) {
            line.source.lines[line.id] = line;
        }
        return (this.lines[line.id] = this.ids[line.id] = line);
    }

    /**
     * connect
     * Connects two elements.
     *
     * @name connect
     * @function
     * @param {Element} s The source element
     * @param {Element} t The target element
     * @param {Object} a Additional fields to be merged.
     */
    connect (s, t, a) {
        if (!s || !t) { return null; }
        return this.addLine(ul.merge(a, {
            source: s
          , target: t
        }));
    }

    /**
     * get
     * Prepares the data to be used in the builder or other client.
     *
     * @name get
     * @function
     * @return {Object} The get composition.
     */
    get () {
        var out = {
            nodes: {}
          , lines: {}
        };

        iterateObject(this.nodes, function (node, id) {

            var cNode = out.nodes[id] = {
                id: id
              , color: node.color || flatColors[numberly(id, 0, flatColors.length)][3]
              , domains: node.domains
              , icon: node.icon
              , name: node.label
              , name: node.name
              , subelms: {}
              , pos: node.pos
            };

            iterateObject(node.subelms, function (selm, sid) {
                var lns = {};
                var cSubElm = cNode.subelms[sid] = {
                    id: selm.id.toString()
                  , label: selm.label
                  , type: selm.type
                  , icon: selm.icon
                  , lines: lns
                };
                iterateObject(selm.lines, function (cLine, id) {
                    out.lines[id] = {
                        source: cLine.source.id.toString()
                      , target: cLine.target.id.toString()
                      , id: id
                      , classes: cLine.classes
                    };
                });
            });
        });
        return out;
    }

    /**
     * addInstance
     * Adds a new instance element.
     *
     * @name addInstance
     * @function
     * @param {Element} cInstance The current instance.
     * @param {Boolean} isServer A flag indicated where to add it: on the server or on the client.
     */
    addInstance (cInstance) {
        var info = null
          , cNode = null
          ;

        cNode = this.addNode(cInstance);
        info = Object(this.appService.e)[cNode.id];

        if (info) {
            if (info.color) {
                cNode.setColor(info.color);
            }
            if (info.pos) {
                cNode.position(info.pos);
            }
        }
    }

    /**
     * addInstances
     * Adds the composition instances.
     *
     * @name addInstances
     * @function
     * @param {Object} instances The application instances.
     */
    addInstances (instances) {
        iterateObject(
            deffy(instances, this.instances)
          , inst => this.addInstance(inst)
        );
    }

    addSubelms () {
        iterateObject(this.nodes, (node, id) => {
            // Add listeners
            iterateObject(node.pFlow, (listener, eventName) => {
                node.addSubElement(listener);
            });
        });
    }

    addLines () {
        let getListener = (eventObj, instanceNode) => {
            if (!eventObj) { return null; }
            if (typpy(eventObj, String)) {
                return instanceNode.subelms[new SubElmId("listener", eventObj, instanceNode)];
            }
            if (typpy(eventObj, "listener")) {
                return instanceNode.subelms[new SubElm(eventObj, instanceNode).id];
            }
            return getListener(eventObj.event, this.nodes[new NodeId({ name: eventObj.to })]);
        };
        iterateObject(this.nodes, (node, id) => {
            iterateObject(node.pFlow, (listener, eventName) => {
                var source = getListener(listener, node);
                this.connect(source, getListener(listener.error, node));
                this.connect(source, getListener(listener.end, node));
                listener.data.forEach(comp => {
                    if (typpy(comp, "emit")) {
                        this.connect(source, getListener(comp, node));
                    }
                });
            });
        });
    }
}

module.exports = Graph;

},{"./line":5,"./node":7,"./node/id":6,"./node/subelm":9,"./node/subelm/id":8,"deffy":11,"flat-colors":91,"iterate-object":93,"numberly":96,"typpy":98,"ul":99}],5:[function(require,module,exports){
"use strict";

// Dependencies
const deffy = require("deffy")
    , idy = require("idy")
    ;

/**
 * Line
 *
 * @name Line
 * @function
 * @param {Object} input An object containing the following fields:
 *
 *  - `source` (Element|SubElement): The source element.
 *  - `target` (Element|SubElement): The target element.
 *  - `classes` (Array): An array with the line classes (they will be appended in the HTML).
 *
 * @return {Line} The `Line` instance.
 */
class Line {
    constructor (input) {
        this.source = input.source;
        this.target = input.target;
        this.id = this.source.id + "_" + this.target.id + "_" + idy();
        this.classes = deffy(input.classes, ["line"]);
        this.classes = this.classes.map(function (c) {
            return "line-" + c;
        });
    }
}

module.exports = Line;

},{"deffy":11,"idy":92}],6:[function(require,module,exports){
"use strict";

const deffy = require("deffy");

// Constants
const INSTANCE_PREFIX = "instance"
    , SEPARATOR = "_"
    ;

class NodeId {
    /**
     * NodeId
     * Creates a new `NodeId` instance.
     *
     * @name NodeId
     * @function
     * @param {NodeElm} input The node instance.
     * @return {NodeId} The `NodeId` instance.
     */
    constructor (input) {
        this.name = input.name;
    }

    /**
     * toString
     * Stringifies a node id.
     *
     * @name toString
     * @function
     * @return {String} The stringified id.
     */
    toString () {
        return [INSTANCE_PREFIX, this.name].join(SEPARATOR);
    }
}

module.exports = NodeId;

},{"deffy":11}],7:[function(require,module,exports){
"use strict";

// Dependencies
const typpy = require("typpy")
    , deffy = require("deffy")
    , SubElm = require("./subelm")
    , iterateObject = require("iterate-object")
    , NodeId = require("./id")
    , mapO = require("map-o")
    ;

class NodeElm {
    /**
     * NodeElm
     * Creates a new `NodeElm` instance.
     *
     * @name NodeElm
     * @function
     * @param {Object} data The Engine instance data, plus the following fields:
     *
     *  - `icon` (String): The node icon.
     *
     * @return {NodeElm} The `NodeElm` instance.
     */
    constructor (data) {
        this.id = new NodeId(data);
        this.icon = deffy(data.icon, "&#xf0c0");
        this.subelms = {};
        this.label = data.name;
        this.domains = [];
        this.name = data.name;
        this.pFlow = data.flow;
        this.flow = mapO(this.pFlow, v => v.enny(), true);
        this.raw = data;
    }

    /**
     * hasFlow
     * Checks if the node has flow or not.
     *
     * @name hasFlow
     * @function
     * @return {Boolean} `true` if the node has flow, `false` otherwise.
     */
    hasFlow () {
        return !!Object(this.flow).length;
    }

    /**
     * setColor
     * Sets or gets the element color.
     *
     * @name setColor
     * @function
     * @param {String} c The new color.
     * @return {String} The set or current color.
     */
    setColor (c) {
        return (this.color = [this.color, c][arguments.length]);
    }

    /**
     * position
     * Sets the element position.
     *
     * @name position
     * @function
     * @param {Number} x The x coordinate.
     * @param {Number} y The y coordinate.
     */
    position (x, y) {
        if (typpy(x, Number) && typpy(y, Number)) {
            return this.position({ x: x, y: y });
        }
        if (!typpy(x, Object) || !typpy(x.x, Number) || !typpy(x.y, Number)) {
            return this.pos;
        }
        this.pos = x;
    }

    /**
     * addSubElement
     *
     * @name addSubElement
     * @function
     * @param {Type} type The subelement type.
     * @param {Object} elm The subelement data.
     * @return {SubElement} The subelement instance.
     */
    addSubElement (subelm) {
        subelm = new SubElm(subelm, this);
        if (this.subelms[subelm.id]) {
            console.warn("Override", subelm);
        }
        return (this.subelms[subelm.id] = subelm);
    }

    /**
     * getListeners
     * Gets the listners for a specific event.
     *
     * @name getListeners
     * @function
     * @param {String} event The event you want to get the listeners for.
     * @return {Array} An array of subelements (listeners).
     */
    getListeners (event) {
        var elm = new SubElm(Enny.TYPES.listener.name, {
                event: event
            }, this)
          , id = elm.id.toString(true)
          , bubbles = []
          ;

        iterateObject(this.subelms, function (cSubelm) {
            if (cSubelm.id.toString(true) === id) {
                bubbles.push(cSubelm);
            }
        });

        return bubbles;
    }

    /**
     * getOrAddSubElm
     * Returns existing subelement or creates another one.
     *
     * @name getOrAddSubElm
     * @function
     * @param {Type} type The subelement type.
     * @param {Object} _elm The subelement data.
     * @return {SubElement} The subelement instance.
     */
    getOrAddSubElm (type, _elm) {
        var elm = new SubElm(type, _elm, this);
        if (this.subelms[elm.id]) {
            return this.subelms[elm.id];
        }
        return this.addSubElement(elm);
    }
}

module.exports = NodeElm;

},{"./id":6,"./subelm":9,"deffy":11,"iterate-object":93,"map-o":94,"typpy":98}],8:[function(require,module,exports){
"use strict";

// Dependencies
const deffy = require("deffy")
    , typpy = require("typpy")
    ;

// Constants
const SEPARATOR = "__";

class SubElmId {

    /**
     * SubElmId
     * Creates a new instance of `SubElmId`.
     *
     * @name SubElmId
     * @function
     * @param {Type|SubElement} type The subelement type or the subelement itself.
     * @param {String} name The subelement name.
     * @param {NodeId} parent The subelement parent id.
     * @return {SubElmId} The `SubElmId` instance.
     */
    constructor (type, name, parent) {

        if (typpy(type, "subelm")) {
            parent = name;
            name = type.name;
            this.index = type.index;
            type = type.type;
        }

        if (parent.id) {
            parent = parent.id;
        }

        this.index = deffy(this.index, 0);
        this.type = type;
        this.name = name;
        this.parentId = parent;
    }

    /**
     * toString
     * Stringifies a subelement id.
     *
     * @name toString
     * @function
     * @param {Boolean} noIndex If `true`, the index value will be ommited from the stringified id.
     * @return {String} The subelement id.
     */
    toString (noIndex) {
        return [this.type, this.parentId, this.name, noIndex ? "" : this.index].join(SEPARATOR);
    }
}

module.exports = SubElmId;

},{"deffy":11,"typpy":98}],9:[function(require,module,exports){
"use strict";

// Dependencies
const deffy = require("deffy")
    , typpy = require("typpy")
    , SubElmId = require("./id")
    ;

class SubElm {
    /**
     * SubElm
     * Creates a `SubElm` instance.
     *
     * @name SubElm
     * @function
     * @param {Type} type The subelement type.
     * @param {Object} data An object containing the following fields:
     * @param {Element} parent The element this subelement belongs to.
     * @return {SubElm} The `SubElm` instance.
     */
    constructor (data, parent) {
        this.type = typpy(data);
        this.icon = data.constructor.types.normal.icon;
        this.name = this._name(data);
        this.label = deffy(data.label, this.name);
        this.id = new SubElmId(this, parent.id);
        this.lines = {};
    }

    /**
     * Name
     * Gets the name from various inputs.
     *
     * @name Name
     * @function
     * @param {Object} input An object containing one of the following fields:
     *
     *  - `name`
     *  - `event`
     *  - `serverMethod`
     *  - `method`
     *
     * @return {String} The subelement name.
     */
    _name (input) {
        return input.name || input.event_name || input.method;
    }
}

SubElm.Id = SubElmId;

module.exports = SubElm;

},{"./id":8,"deffy":11,"typpy":98}],10:[function(require,module,exports){
"use strict";

// Dependencies
const EngineParser = require("engine-parser")
    , Graph = require("./graph")
    ;

class EngineBuilder extends EngineParser {
    getGraph (fn) {
        this.parse((err, parsed) => {
            if (err) { return fn(err); }
            fn(null, new Graph(parsed).get());
        });
    }
}

module.exports = EngineBuilder;

},{"./graph":4,"engine-parser":12}],11:[function(require,module,exports){
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

},{"typpy":98}],12:[function(require,module,exports){
"use strict";

// Dependencies
const EngineApp = require("engine-app")
    , Parser = require("./parser")
    , iterateObject = require("iterate-object")
    , typpy = require("typpy")
    , sameTime = require("same-time")
    ;

class EngineParser extends EngineApp {

    /**
     * EngineParser
     * Creates a new instance of `EngineParser`.
     *
     *
     * @name EngineParser
     * @function
     * @param {String} app The application name.
     * @return {EngineParser} The `EngineParser` instance.
     */
    constructor (appPath, adapter) {
        super(appPath, adapter);
    }

    /**
     * parse
     * Parses the instances in a format that Enny can understand and stringify.
     *
     * @name parse
     * @function
     * @param {Function} cb The callback function.
     */
    parse (cb) {

        // Read the instances
        this.getAllInstances((err, data) => {

            if (err) { return cb(err); }

            // Parse the raw json
            this.parser = new Parser(data);
            cb(null, this.parser.parse());
        });
    }

    /**
     * renameInstance
     * Renames an instance.
     *
     * @name renameInstance
     * @function
     * @param {String} oldName The old instance name.
     * @param {String} newName The new instance name.
     * @param {Function} cb The callback function.
     * @return {EngineParser} The `EngineParser` instance.
     */
    renameInstance (oldName, newName, cb) {
        if (typeof oldName !== "string") {
            return cb(new TypeError("The old name should be a string."));
        }
        if (typeof newName !== "string") {
            return cb(new TypeError("The new name should be a string."));
        }
        this.parse((err, data) => {
            if (err) { return cb(err); }
            this.parser.data.renameInstance(oldName, newName, (err, changedInstances) => {
                if (err) { return cb(err); }
                this.parser.instances = this.parser.data.toObject();
                changedInstances[newName] = true;
                cb(null, changedInstances, oldName);
            });
        });
        return this;
    }

    /**
     * save
     *
     * @name save
     * @function
     * @param {Object} options An object containing the following fields:
     *
     *  - `save` (Object|String): The instance name to save or an object with the instance names (e.g. `{ "layout": true }`).
     *  - `delete` (Object|String): The instance name to delete or an object with the instance names (e.g. `{ "layout": true }`).
     *
     * @param {Function} cb The callback function.
     */
    save (options, cb) {
        var foos = [];

        if (!options.save && !options.delete) {
            return cb(null, null);
        }

        // { save: "layout" }
        if (typeof options.save === "string") {
            let s = options.save;
            options.save = {};
            options.save[s] = true;
        }

        // { delete: "layout" }
        if (typeof options.delete === "string") {
            let d = options.delete;
            options.delete = {};
            options.delete[d] = true;
        }

        // Collect delete
        iterateObject(options.delete, (_, cDelete) => {
            foos.push(done => {
                this.removeInstance(cDelete, done);
            });
        });

        // Collect save
        iterateObject(options.save, (_, _cSave) => {
            var cSave = this.parser.instances[_cSave] || _cSave;

            // Push the new function
            foos.push(done => {
                this.upsertInstance(cSave.name, cSave, done);
            });
        });

        sameTime(foos, cb);
    }
}

module.exports = EngineParser;

},{"./parser":13,"engine-app":19,"iterate-object":82,"same-time":83,"typpy":85}],13:[function(require,module,exports){
"use strict";

// Dependencies
const Enny = require("enny")
    , ParseFlow = require("../parsers/flow")
    , iterateObject = require("iterate-object")
    ;

/**
 * EngineParser
 * Creates a new instance of `EngineParser`.
 *
 * @name EngineParser
 * @function
 * @param {Object} instances An object with the instances' raw content.
 * @return {EngineParser} The `EngineParser` instance.
 */
class EngineParser {

    constructor (instances) {
        this.instances = instances;
    }

    /**
     * parse
     * Parses the instances.
     *
     * @name parse
     * @function
     * @return {Enny} The `Enny` instance.
     */
    parse () {
        this.data = new Enny();
        iterateObject(this.instances, cInstance => {
            var inst = this.data.addInstance(cInstance);
            var pFlow = ParseFlow(cInstance.flow, cInstance.name);
            iterateObject(pFlow, ev => inst.on(ev));
        });
        return this.data;
    }

    /**
     * getInstance
     * Gets the specified instance.
     *
     * @name getInstance
     * @function
     * @param {String} input The instance name.
     * @return {Object} The instance object (note this is in the Enny format).
     */
    getInstance (input) {
        return this.data.instances[input];
    }
}

module.exports = EngineParser;

},{"../parsers/flow":17,"enny":69,"iterate-object":82}],14:[function(require,module,exports){
const flowTypes = require("engine-flow-types")
    , Err = require("err")
    ;

module.exports = input => {
    var prefix = input.match(flowTypes._prefixesRegex)[1] || ""
      , output = {
            error: null
          , prefix: prefix
          , instance: undefined
          , type: flowTypes._prefixes[prefix]
        }
      ;

    input = input.substring(prefix.length);
    output.command = input;
    var splits = input.split("/");
    if (splits.length === 2) {
        output.instance = splits[0];
        output.command = splits[1];
    }

    if (!prefix) {
        output.error = new Err("The prefix is missing.", "MISSING_PREFIX");
    } else if (!output.type) {
        output.error = new Err("The prefix is invalid.", "INVALID_PREFIX");
    }

    return output;
};

},{"engine-flow-types":51,"err":81}],15:[function(require,module,exports){
// Dependencies
const ParseMethod = require("./method")
    , Enny = require("enny")
    , Ul = require("ul")
    , Typpy = require("typpy")
    , flowTypes = require("engine-flow-types")
    , parseCommand = require("./flow-command")
    , deffy = require("deffy")
    ;

/**
 * flowComponent
 * Parses the flow components.
 *
 * @name flowComponent
 * @function
 * @param {Object} _input Raw engine-syntax flow component.
 * @param {String} instName The instance name.
 * @return {FlowComponent} The parsed input.
 */
module.exports = function (_input, instName) {
    var input = Ul.clone(_input);

    if (Typpy(input, String)) {
        input = [input];
    }

    var pInput = parseCommand(input[0]);
    if (pInput.error) {
        // TODO Not sure how to handle such errors
        throw pInput.error;
    }

    pInput.instance = deffy(pInput.instance, instName);

    switch (pInput.type.func) {
        case flowTypes.DataHandler:
        case flowTypes.StreamHandler:
            return new pInput.type.func(
                pInput.command
              , {
                    to: pInput.instance
                  , once: pInput.type.type === "once"
                  , leaking: pInput.type.type === "leaking"
                }
              , input[1]
            );
        case flowTypes.Emit:
            pInput.instance = deffy(input[1] && input[1].to, pInput.instance)
            return new flowTypes.Emit(
                pInput.command
              , {
                    to: pInput.instance
                  , net: pInput.type.type === "net"
                  , leaking: pInput.type.type === "leaking"
                }
            );
        default:
            throw new Error("Unsupported type.");
    }
};

},{"./flow-command":14,"./method":18,"deffy":11,"engine-flow-types":51,"enny":69,"typpy":85,"ul":86}],16:[function(require,module,exports){
// Dependencies
const parseComponent = require("./flow-component");

/**
 * parseComponents
 *
 * @name parseComponents
 * @function
 * @param {Arrayt} input Raw engine-syntax flow elements.
 * @param {String} instName The instance name.
 * @return {Array} The parsed flow components.
 */
module.exports = function (input, instName) {
    return input.map(c => parseComponent(c, instName));
};

},{"./flow-component":15}],17:[function(require,module,exports){
// Dependencies
const parseComponents = require("./flow-components")
    , iterateObject = require("iterate-object")
    , flowTypes = require("engine-flow-types");
    ;

/**
 * flowElements
 *
 * @name flowElements
 * @function
 * @param {Arrayt} _input Raw engine-syntax flow elements.
 * @param {String} instName The instance name.
 * @return {Object} The parsed flow elements.
 */
module.exports = function (_input, instName) {
    var parsed = {};
    iterateObject(_input, (rawEvent, eventName) => {
        var listener = parsed[eventName] = new flowTypes.Listener(
            eventName,
            rawEvent.r,
            rawEvent.e
        );
        listener.addData(parseComponents(rawEvent.d, instName));
    });
    return parsed;
};

},{"./flow-components":16,"engine-flow-types":51,"iterate-object":82}],18:[function(require,module,exports){
var Enny = require("enny");

/**
 * parseMethod
 * Parses method inputs.
 *
 * @name parseMethod
 * @function
 * @param {String} input The method input. Some common usages are:
 *
 *   - `instance/method`
 *   - `!instance/method`
 *   - `>instance/method`
 *   - `:instance/method`
 *   - `method`
 *
 * @param {String} defaultIns The instance name.
 * @return {Object} The parsed input.
 */
module.exports = function (input, defaultIns) {

    var output = {
        instance: defaultIns
      , type: Enny.TYPES.streamHandler
    };

    switch (input.charAt(0)) {
        case "!":
            output.type = Enny.TYPES.errorHandler;
            input = input.substr(1);
            break;
        case ":":
            output.type = Enny.TYPES.dataHandler;
            input = input.substr(1);
            break;
        case ">":
            output.disableInput = true;
            output.type = Enny.TYPES.streamHandler;
            input = input.substr(1);
            break;
        case "@":
            output.type = Enny.TYPES.link;
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
};

},{"enny":69}],19:[function(require,module,exports){
"use strict";

const readJson = require("r-json")
    , writeJson = require("w-json")
    , abs = require("abs")
    , path = require("path")
    , EnginePaths = require("engine-paths")
    , CompositionCrud = require("engine-composition-crud")
    ;

class EngineApp {
    /**
     * EngineApp
     * Creates a new instance of `EngineApp`.
     *
     * @name EngineApp
     * @function
     * @param {String} appPath The app path.
     */
    constructor (appPath, compositionCrud) {
        if (typeof appPath !== "string" || !appPath) {
            throw new TypeError("The app parameter should be a string.");
        }
        this.paths = new EnginePaths(appPath);
        this.crud = compositionCrud || new CompositionCrud(this.paths);
    }

    /**
     * getPackage
     * Gets the package.json content.
     *
     * @name getPackage
     * @function
     * @param {Function} cb The callback function.
     * @return {Object} The `package.json` content as json (if called without a callback function).
     */
    getPackage (cb) {
        return readJson(this.paths.package, cb);
    }

    /**
     * setPackage
     * Sets the package.json content.
     *
     * @name setPackage
     * @function
     * @param {Object} data The data to set in the file.
     * @param {Function} cb The callback function.
     */
    setPackage (data, cb) {
        return writeJson(this.paths.package, data, cb);
    }

    /**
     * createInstance
     * Creates a new instance.
     *
     * @name createInstance
     * @function
     * @param {String} name The instance name.
     * @param {Object} data The instance content.
     * @param {Function} cb The callback function.
     */
    createInstance (name, data, cb) {
        return this.crud.create(name, data, cb);
    }

    /**
     * readInstance
     * Gets the instance content.
     *
     * @name readInstance
     * @function
     * @param {String} name The instance name.
     * @param {Function} cb The callback function.
     */
    readInstance (name, cb) {
        this.crud.read(name, cb);
    }

    /**
     * updateInstance
     * Updates an instance.
     *
     * @name updateInstance
     * @function
     * @param {String} name The instance name.
     * @param {Object} data The instance content.
     * @param {Function} cb The callback function.
     */
    updateInstance (name, data, cb) {
        return this.crud.update(name, data, cb);
    }

    /**
     * removeInstance
     * Removes an instance.
     *
     * @name removeInstance
     * @function
     * @param {String} name The instance name.
     * @param {Function} cb The callback function.
     */
    removeInstance (name, cb) {
        return this.crud.remove(name, cb);
    }

    /**
     * listInstances
     * List instances.
     *
     * @name listInstance
     * @function
     * @param {Function} cb The callback function.
     */
    listInstances (cb) {
        return this.crud.list(cb);
    }

    /**
     * getAllInstances
     * Read all instances.
     *
     * @name getAllnstances
     * @function
     * @param {Function} cb The callback function.
     */
    getAllInstances (cb) {
        return this.crud.readAll(cb);
    }

    /**
     * renameInstance
     * Renames the specified instance.
     *
     * @name renameInstance
     * @function
     * @param {String} oldName The old instance name.
     * @param {String} newName The new instance name.
     * @param {Function} cb The callback function.
     */
    renameInstance (oldName, newName, cb) {
        return this.crud.rename(oldName, newName, cb);
    }

    /**
     * upsertInstance
     * Creates or updates the specified instance.
     *
     * @name upsertInstance
     * @function
     * @param {String} name The instance name.
     * @param {Object} data The instance content.
     * @param {Function} cb The callback function.
     */
    upsertInstance (name, data, cb) {
        return this.crud.upsert(name, data, cb);
    }
}

module.exports = EngineApp;

},{"abs":20,"engine-composition-crud":24,"engine-paths":37,"path":2,"r-json":42,"w-json":43}],20:[function(require,module,exports){
// Dependencies
var Path = require("path")
  , Ul = require("ul")
  ;

/**
 * Abs
 * Computes the absolute path of an input.
 *
 * @name Abs
 * @function
 * @param {String} input The input path.
 * @return {String} The absolute path.
 */
function Abs(input) {
    if (input.charAt(0) === "/") { return input; }
    if (input.charAt(0) === "~" && input.charAt(1) === "/") {
        input = Ul.HOME_DIR + input.substr(1);
    }
    return Path.resolve(input);
}

module.exports = Abs;

},{"path":2,"ul":21}],21:[function(require,module,exports){
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
},{"_process":3,"deffy":22,"typpy":23}],22:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11,"typpy":23}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
"use strict";

const wJson = require("w-json")
    , rJson = require("r-json")
    , fs = require("fs")
    , isThere = require("is-there")
    , errors = require("engine-comp-crud-errors")
    , sameTime = require("same-time")
    , CompositionAdapter = require("engine-composition-adapter")
    ;

class CompositionCRUD extends CompositionAdapter {

    /**
     * CompositionCRUD
     * Creates a new instance of `CompositionCRUD`.
     *
     * @name constructor
     * @function
     * @param {EnginePaths} paths The `EnginePaths` instance.
     */
    constructor (paths) {
        super();
        this.paths = paths;
    }

    /**
     * exists
     * Checks if an instance exists.
     *
     * @name exists
     * @function
     * @param {String} name The instance name.
     * @param {Function} cb The callback function.
     */
    exists (name, cb) {
        isThere(this.paths.instance(name), exists => cb(null, exists));
    }

    /**
     * list
     * List the instances.
     *
     * @name list
     * @function
     * @param {Function} cb The callback function.
     */
    list (cb) {
        fs.readdir(this.paths.composition, (err, instances) => {
            if (err) { return cb(err); }
            instances = instances.filter(c => /\.json$/.test(c)).map(c => c.replace(".json", ""));
            cb(null, instances);
        });
    }

    /**
     * readAll
     * Read all the instances.
     *
     * @name readAll
     * @function
     * @param {Function} cb The callback function.
     */
    readAll (cb) {
        this.list((err, instances) => {
            if (err) { return cb(err); }
            var result = {};
            sameTime(instances.map(c => {
                return done => {
                    this.read(c, (err, data) => {
                        if (err) { return cb(err); }
                        result[c] = data;
                        done();
                    });
                }
            }), err => {
                if (err) { return cb(err); }
                cb(null, result);
            });
        });
    }

    /**
     * create
     * Creates a new instance.
     *
     * @name create
     * @function
     * @param {String} name The instance name.
     * @param {Object} data The instance content.
     * @param {Function} cb The callback function.
     */
    create (name, data, cb) {
        if (typeof data === "function") {
            cb = data;
            data = {};
        }
        data = data || {};
        this.exists(name, (err, exists) => {
            if (err) { return cb(err); }
            if (exists) {
                return cb(errors.INSTANCE_EXISTS_ALREADY(name));
            }
            data.name = name;
            wJson(this.paths.instance(name), data, cb);
        })
    }

    /**
     * read
     * Reads the instance content.
     *
     * @name read
     * @function
     * @param {String} name The instance name.
     * @param {Function} cb The callback function.
     */
    read (name, cb) {
        rJson(this.paths.instance(name), (err, data) => {
            if (err) {
                if (err.code === "ENOENT") {
                    err = errors.INSTANCE_DOES_NOT_EXIST(name);
                }
                return cb(err);
            }
            cb(null, data);
        });
    }

    /**
     * update
     * Updates the instance content.
     *
     * @name update
     * @function
     * @param {String} name The instance name.
     * @param {Object} data The instance content.
     * @param {Function} cb The callback function.
     */
    update (name, data, cb) {
        this.exists(name, (err, exists) => {
            if (err) { return cb(err); }
            if (!exists) {
                return cb(errors.INSTANCE_DOES_NOT_EXIST(name));
            }
            data.name = name;
            wJson(this.paths.instance(name), data, cb);
        });
    }

    /**
     * remove
     * Removes the instance.
     *
     * @name remove
     * @function
     * @param {String} name The instance name.
     * @param {Function} cb The callback function.
     */
    remove (name, cb) {
        this.exists(name, (err, exists) => {
            if (err) { return cb(err); }
            if (!exists) {
                return cb(errors.INSTANCE_DOES_NOT_EXIST(name));
            }
            fs.unlink(this.paths.instance(name), cb);
        });
    }

    /**
     * rename
     * Renames the instance.
     *
     * @name rename
     * @function
     * @param {String} oldName The old instance name.
     * @param {String} newName The new instance name.
     * @param {Function} cb The callback function.
     */
    rename (oldName, newName, cb) {
        this.exists(newName, (err, exists) => {
            if (err) { return cb(err); }
            if (!exists) {
                return cb(errors.INSTANCE_EXISTS_ALREADY(name));
            }
            this.read(oldName, (err, oldInstance) => {
                if (err) { return cb(err); }
                oldInstance.name = newName;
                this.create(newName, oldInstance, err => {
                    if (err) { return cb(err); }
                    this.delete(oldInstance, cb);
                });
            });
        });
    }

    /**
     * upsert
     * Creates or updates the specified instance.
     *
     * @name upsert
     * @function
     * @param {String} name The instance name.
     * @param {Object} data The instance content.
     * @param {Function} cb The callback function.
     */
    upsert (name, data, cb) {
        this.update(name, data, (err, res) => {
            if (err && err.code === "INSTANCE_DOES_NOT_EXIST") {
                return this.create(name, data, cb);
            }
            cb(err, res);
        });
    }
}

module.exports = CompositionCRUD;

},{"engine-comp-crud-errors":25,"engine-composition-adapter":28,"fs":1,"is-there":31,"r-json":32,"same-time":33,"w-json":36}],25:[function(require,module,exports){
const Err = require("err");

module.exports = {
    /**
     * INSTANCE_EXISTS_ALREADY
     *
     * @name INSTANCE_EXISTS_ALREADY
     * @function
     * @param {String} name The instance name.
     * @return {Error} The error object.
     */
    INSTANCE_EXISTS_ALREADY: function (name) {
        return new Err(`The ${name} instance exists already.`, {
            code: "INSTANCE_EXISTS_ALREADY"
          , instance_name: name
        });
    }

    /**
     * INSTANCE_DOES_NOT_EXIST
     *
     * @name INSTANCE_DOES_NOT_EXIST
     * @function
     * @param {String} name The instance name.
     * @return {Error} The error object.
     */
  , INSTANCE_DOES_NOT_EXIST: function (name) {
        return new Err(`The ${name} instance does not exist.`, {
            code: "INSTANCE_DOES_NOT_EXIST"
          , instance_name: name
        });
    }
};

},{"err":26}],26:[function(require,module,exports){
// Dependencies
var typpy = require("typpy");

/**
 * Err
 * Create a custom error object.
 *
 * @name Err
 * @function
 * @param {String|Error} error The error message or an existing `Error` instance.
 * @param {String|Object} code The error code or the data object.
 * @param {Object} data The data object (its fields will be appended to the `Error` object).
 * @return {Error} The custom `Error` instance.
 */
function Err(error, code, data) {

    // Create the error
    if (!typpy(error, Error)) {
        error = new Error(error);
    }

    // Err(message, code, data);
    // Err(message, data);
    if (typpy(data, Object)) {
        data.code = code;
    } else if (typpy(code, Object)) {
        data = code;
        code = undefined;
    } else if (!typpy(code, undefined)) {
        data = { code: code };
    }

    if (data) {
        Object.keys(data).forEach(function (c) {
            error[c] = data[c];
        });
    }

    return error;
}

module.exports = Err;

},{"typpy":27}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
"use strict";

// Dependencies
const Err = require("err");

// Constants
const NOT_IMPLEMENTED_ERR = function (method) {
    return new Err(`Method ${method} not implement. Override the ${method} method in your adapter to implement this.`, "METHOD_NOT_IMPLEMENTED");
};

class CompositionAdapter {
    /**
     * exists
     * Checks if an instance exists.
     *
     * @name exists
     * @function
     * @param {String} name The instance name.
     * @param {Function} cb The callback function.
     */
    exists (name, cb) {
        cb(NOT_IMPLEMENTED_ERR("exists"));
    }

    /**
     * list
     * List the instances.
     *
     * @name list
     * @function
     * @param {Function} cb The callback function.
     */
    list (cb) {
        cb(NOT_IMPLEMENTED_ERR("list"));
    }

    /**
     * readAll
     * Read all the instances.
     *
     * @name readAll
     * @function
     * @param {Function} cb The callback function.
     */
    readAll (cb) {
        cb(NOT_IMPLEMENTED_ERR("readAll"));
    }

    /**
     * create
     * Creates a new instance.
     *
     * @name create
     * @function
     * @param {String} name The instance name.
     * @param {Object} data The instance content.
     * @param {Function} cb The callback function.
     */
    create (name, data, cb) {
        cb(NOT_IMPLEMENTED_ERR("create"));
    }

    /**
     * read
     * Reads the instance content.
     *
     * @name read
     * @function
     * @param {String} name The instance name.
     * @param {Function} cb The callback function.
     */
    read (name, cb) {
        cb(NOT_IMPLEMENTED_ERR("read"));
    }

    /**
     * update
     * Updates the instance content.
     *
     * @name update
     * @function
     * @param {String} name The instance name.
     * @param {Object} data The instance content.
     * @param {Function} cb The callback function.
     */
    update (name, data, cb) {
        cb(NOT_IMPLEMENTED_ERR("update"));
    }

    /**
     * remove
     * Removes the instance.
     *
     * @name remove
     * @function
     * @param {String} name The instance name.
     * @param {Function} cb The callback function.
     */
    remove (name, cb) {
        cb(NOT_IMPLEMENTED_ERR("remove"));
    }

    /**
     * rename
     * Renames the instance.
     *
     * @name remove
     * @function
     * @param {String} oldName The old instance name.
     * @param {String} newName The new instance name.
     * @param {Function} cb The callback function.
     */
    rename (oldName, newName, cb) {
        cb(NOT_IMPLEMENTED_ERR("rename"));
    }

    /**
     * upsert
     * Creates or updates the specified instance.
     *
     * @name upsert
     * @function
     * @param {String} name The instance name.
     * @param {Object} data The instance content.
     * @param {Function} cb The callback function.
     */
    upsert (name, data, cb) {
        cb(NOT_IMPLEMENTED_ERR("upsert"));
    }
}

module.exports = CompositionAdapter;

},{"err":29}],29:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"dup":26,"typpy":30}],30:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"dup":27}],31:[function(require,module,exports){
// Dependencies
var Fs = require("fs");

/**
 * IsThere
 * Checks if a file or directory exists on given path.
 *
 * @name IsThere
 * @function
 * @param {String} path The path to the file or directory.
 * @param {Function} callback The callback function called with a boolean value
 * representing if the file or directory exists. If this parameter is not a
 * function, the function will run the synchronously and return the value.
 * @return {IsThere|Boolean} The `IsThere` function if the `callback` parameter
 * was provided, otherwise a boolean value indicating if the file/directory
 * exists or not.
 */
function IsThere(path, callback) {

    // Async
    if (typeof callback === "function") {
        Fs.stat(path, function (err) {
            callback(!err);
        });
        return IsThere;
    }

    // Sync
    try {
        Fs.statSync(path);
        return true;
    } catch (err) {
        return false;
    };
}

module.exports = IsThere;

},{"fs":1}],32:[function(require,module,exports){
// Dependencies
var Fs = require("fs");

/**
 * rJson
 *
 * @name rJson
 * @function
 * @param {String} path The JSON file path.
 * @param {Function} callback An optional callback. If not passed, the function will run in sync mode.
 */
function rJson(path, callback) {

    if (typeof callback === "function") {
        Fs.readFile(path, "utf-8", function (err, data) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                err = err || e;
            }
            callback(err, data);
        });
        return;
    }

    return JSON.parse(Fs.readFileSync(path));
}

module.exports = rJson;

},{"fs":1}],33:[function(require,module,exports){
(function (process){
// Dependencies
var Deffy = require("deffy");

/**
 * SameTime
 * Calls functions in parallel and stores the results.
 *
 * @name SameTime
 * @function
 * @param {Array} arr An array of functions getting the callback parameter in the first argument.
 * @param {Function} cb The callback function called with:
 *
 *  - first parameter: `null` if there were no errors or an array containing the error values
 *  - `1 ... n` parameters: arrays containing the callback results
 *
 * @return {SameTime} The `SameTime` function.
 */
function SameTime(arr, cb) {

    var result = []
      , complete = 0
      , length = arr.length
      ;

    if (!arr.length) {
        return process.nextTick(cb);
    }

    // Run functions
    arr.forEach(function (c, index) {
        var _done = false;

        // Call the current function
        c(function () {

            if (_done) { return; }
            _done = true;

            var args = [].slice.call(arguments)
              , cRes = null
              , i = 0
              ;

            // Prepare the result data
            for (; i < args.length; ++i) {
                cRes = result[i] = Deffy(result[i], []);
                cRes[index] = args[i];
            }

            // Check if all functions send the responses
            if (++complete !== length) { return; }
            if (!Deffy(result[0], []).filter(Boolean).length) {
                result[0] = null;
            }
            cb.apply(null, result);
        });
    });
}

module.exports = SameTime;

}).call(this,require('_process'))
},{"_process":3,"deffy":34}],34:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11,"typpy":35}],35:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"dup":27}],36:[function(require,module,exports){
// Dependencies
var Fs = require("fs");

/**
 * wJson
 * Writes a JSON file.
 *
 * @name wJson
 * @function
 * @param {String} path The JSON file path.
 * @param {Object} data The JSON data to write in the provided file.
 * @param {Object|Number|Boolean} options An object containing the fields below.
 * If boolean, it will be handled as `new_line`, if number it will be handled as `space`.
 *
 *  - `space` (Number): An optional space value for beautifying the json output (default: `2`).
 *  - `new_line` (Boolean): If `true`, a new line character will be added at the end of the stringified content.
 *
 * @param {Function} callback An optional callback. If not passed, the function will run in sync mode.
 */
function wJson(path, data, options, callback) {

    if (typeof options === "function") {
        callback = options;
        options = {};
    } else if (typeof options === "number") {
        options = {
            space: options
        };
    } else if (typeof options === "boolean") {
        options = {
            new_line: options
        };
    }

    options = options || {};

    options.space = typeof options.space === "number" ? options.space : 2;
    options.new_line = !!options.new_line;

    Fs["writeFile" + (typeof callback === "function" ? "" : "Sync")](
        path
      , JSON.stringify(data, null, options.space) + (options.new_line ? "\n" : "")
      , callback
    );
}

module.exports = wJson;

},{"fs":1}],37:[function(require,module,exports){
"use strict";

const path = require("path")
    , abs = require("abs")
    ;

class EnginePaths {
    /**
     * EnginePaths
     * Creates a new instance of `EnginePaths`.
     *
     * @name EnginePaths
     * @function
     * @param {String} appPath The path to the Engine app.
     */
    constructor (appPath) {
        this.root = abs(appPath);
        this.package = path.join(this.root, "package.json");
        this.composition = path.join(this.root, "composition");
        this.service = path.join(this.root, ".service.json");
    }

    /**
     * instance
     * Gets the absolute path to the JSON file.
     *
     * @name instance
     * @function
     * @param {String} name The instance name (without the `.json` suffix).
     * @return {String} The absolute path to the instance file.
     */
    instance (name) {
        return path.join(this.composition, name + ".json");
    }
}

module.exports = EnginePaths;

},{"abs":38,"path":2}],38:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"dup":20,"path":2,"ul":39}],39:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"_process":3,"deffy":40,"dup":21,"typpy":41}],40:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11,"typpy":41}],41:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"dup":23}],42:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"dup":32,"fs":1}],43:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"dup":36,"fs":1}],44:[function(require,module,exports){
"use strict";

const Handler = require("./handler");

class DataHandler extends Handler {
    constructor (method, options, data) {
        if (typeof options === "boolean") {
            options = { once: options };
        }
        super(options.to, method, data);
        this.once = options.once || false;
    }
}

module.exports = DataHandler;

},{"./handler":46}],45:[function(require,module,exports){
"use strict";

class Emit {
    constructor (eventName, options) {
        options = options || {};
        this.event = eventName;
        this.to = options.to;
        this.net = options.net;
        this.leaking = options.leaking;
    }
}

module.exports = Emit;

},{}],46:[function(require,module,exports){
"use strict";

class Handler {
    /**
     * Handler
     * Creates a new `Handler` instance.
     *
     * @name Handler
     * @function
     * @param {Object} data An object containing the following fields:
     *
     *  - `to` (String): The target instance name.
     *  - `args` (Array): Additional arguments in the handler call.
     *  - `isStream` (Boolean): If `true`, the handler will be a stream handler.
     *  - `handler` (String): The method name.
     *  - `isLink` (Boolean): If `true`, the handler will be a server side method (called from the client)–aka *link*.
     *
     * @return {Handler} The `Handler` instance:
     */
    constructor (instance, method, options) {
        this.to = instance;
        this.options = options;
        this.method = method;
    }

    get () {
        var methodStr = this.method;

        if (typeof this.to === "string") {
            methodStr = this.to + "/" + this.method;
        }

        return [methodStr, this.options];
    }

    toFlow (arr) {
        if (arr[1]) {
            return arr;
        }
        return arr[0];
    }
}

module.exports = Handler;

},{}],47:[function(require,module,exports){
var types = module.exports = {
    Listener: require("./listener")
  , DataHandler: require("./data-handler")
  , StreamHandler: require("./stream-handler")
  , Emit: require("./emit")
};

},{"./data-handler":44,"./emit":45,"./listener":48,"./stream-handler":49}],48:[function(require,module,exports){
"use strict";

class Listener {
    constructor (event, error, end) {
        this.event_name = event;
        this.data = [];
        this.error = error || null;
        this.end = end || null;
    }
    addData(comp) {
        if (Array.isArray(comp)) {
            return comp.forEach(c => this.addData(c));
        }
        this.data.push(comp);
    }
    setErrorEvent(eventName) {
        this.error = eventName;
    }
    setEndEvent(eventName) {
        this.end = eventName;
    }
}

module.exports = Listener;

},{}],49:[function(require,module,exports){
"use strict";

const Handler = require("./handler")
    , deffy = require("deffy")
    ;

class StreamHandler extends Handler {
    constructor (method, options, data) {
        options = Object(options);
        super(options.to, method, data);
        this.leaking = options.leaking = deffy(options.leaking, false);
    }
}

module.exports = StreamHandler;

},{"./handler":46,"deffy":52}],50:[function(require,module,exports){
const iterateObject = require("iterate-object")
    , typpy = require("typpy")
    , mapObject = require("map-o")
    ;

function prepareData(input) {
    iterateObject(input, value => {

        if (typpy(value.types, String)) {
            value.types = { normal: [value.types] };
        } else if (typpy(value.types, Array)) {
            value.types = { normal: value.types };
        }

        value.types = Object(value.types);
        mapObject(value.types, (name, value) => {
            return {
                char: value[0]
              , icon: value[1] && ("&#x" + value[1])
            };
        });
    });
    return input;
}

var Coreconstructor_names = module.exports = prepareData({
    listener: {
        constructor_name: "Listener"
      , types: {
            normal: [null, "f087"]
        }
    }
  , data_handler: {
        constructor_name: "DataHandler"
      , types: {
            normal: [":", "f087"]
          , once: [".", "f087"]
        }
    }
  , emit: {
        constructor_name: "Emit"
      , types: {
            normal: [">>", "f087"]
          , error: [undefined, "f02d"]
          , end: [undefined, "f02d"]
          , leaking: ["|*", "f0c4"]
        }
    }
  , stream_handler: {
        constructor_name: "StreamHandler"
      , types: {
            normal: [">*", "f0c4"]
          , leaking: ["|*", "f0c4"]
        }
    }
});

},{"iterate-object":53,"map-o":54,"typpy":61}],51:[function(require,module,exports){
// Dependencies
var types = require("./core")
  , constructors = require("./constructors")
  , iterateObject = require("iterate-object")
  , ul = require("ul")
  , typpy = require("typpy")
  , regexEscape = require("regex-escape")
  ;

// Initialize the Engine Types object
var EngineTypes = module.exports = {};
EngineTypes._prefixes = {};

// Add the constructors
iterateObject(types, (value, name) => {
    var t = EngineTypes[value.constructor_name] = constructors[value.constructor_name];
    if (!t) {
        throw new Error("There is no constructor with this name: " + name);
    }

    // Append the _prefixes
    iterateObject(value.types, (cType, typeName) => {
        EngineTypes._prefixes[cType.char] = {
            func: t
          , type: typeName
        };
    });

    iterateObject(ul.merge({
        name: name
    }, value), function (v, n) {
        if (n === "chars" && typpy(v, String)) {
            v = { normal: v };
        }
        t[n] = v;
    });
});

EngineTypes._prefixesRegex = new RegExp(
    `^(${Object.keys(EngineTypes._prefixes).map(regexEscape).join("|")})[a-z]`
  , "i"
);

},{"./constructors":47,"./core":50,"iterate-object":53,"regex-escape":60,"typpy":61,"ul":62}],52:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11,"typpy":61}],53:[function(require,module,exports){
/**
 * IterateObject
 * Iterates an object. Note the object field order may differ.
 *
 * @name IterateObject
 * @function
 * @param {Object} obj The input object.
 * @param {Function} fn A function that will be called with the current value, field name and provided object.
 * @return {Function} The `IterateObject` function.
 */
function IterateObject(obj, fn) {
    var i = 0
      , keys = []
      ;

    if (Array.isArray(obj)) {
        for (; i < obj.length; ++i) {
            if (fn(obj[i], i, obj) === false) {
                break;
            }
        }
    } else {
        keys = Object.keys(obj);
        for (; i < keys.length; ++i) {
            if (fn(obj[keys[i]], keys[i], obj) === false) {
                break;
            }
        }
    }
}

module.exports = IterateObject;

},{}],54:[function(require,module,exports){
// Dependencies
var IterateObject = require("iterate-object")
  , Ul = require("ul")
  ;

/**
 * Mapo
 * Array-map like for objects.
 *
 * @name Mapo
 * @function
 * @param {Object} obj The input object.
 * @param {Function} fn A function returning the field values.
 * @param {Boolean} clone If `true`, the input object will be cloned, so the original object will not be changed.
 * @return {Object} The modified object.
 */
function Mapo(obj, fn, clone) {
    if (clone) {
        obj = Ul.clone(obj);
    }
    IterateObject(obj, function (v, n, o) {
        obj[n] = fn(n, v, o);
    });
    return obj;
}

/**
 * proto
 * Appends the `map` method to the `Object` prototype.
 *
 * @name proto
 * @function
 */
Mapo.proto = function () {
    Object.prototype.map = function (fn) {
        return Mapo(this, fn);
    };
};

module.exports = Mapo;

},{"iterate-object":55,"ul":56}],55:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"dup":53}],56:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"_process":3,"deffy":57,"dup":21,"typpy":59}],57:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11,"typpy":58}],58:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"dup":27}],59:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"dup":27}],60:[function(require,module,exports){
/**
 * RegexEscape
 * Escapes a string for using it in a regular expression.
 *
 * @name RegexEscape
 * @function
 * @param {String} input The string that must be escaped.
 * @return {String} The escaped string.
 */
function RegexEscape(input) {
    return input.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

/**
 * proto
 * Adds the `RegexEscape` function to `RegExp` class.
 *
 * @name proto
 * @function
 * @return {Function} The `RegexEscape` function.
 */
RegexEscape.proto = function () {
    RegExp.escape = RegexEscape;
    return RegexEscape;
};

module.exports = RegexEscape;

},{}],61:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"dup":27}],62:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"_process":3,"deffy":63,"dup":21,"typpy":65}],63:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11,"typpy":64}],64:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"dup":27}],65:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"dup":27}],66:[function(require,module,exports){
"use strict";

const flowTypes = require("engine-flow-types");

function flowComponent(data) {

    // Emit
    if (data.emit) {
        return new flowTypes.Emit(
            data.emit
          , data
        );
    }

    // Data handler
    if (data.dataHandler) {
        return new flowTypes.DataHandler(
            data.dataHandler
          , data
          , data.data
        );
    }

    // Stream handler
    if (data.streamHandler) {
        return new flowTypes.StreamHandler(
            data.streamHandler
          , data
          , data.data
        );
    }
}

module.exports = flowComponent;

},{"engine-flow-types":51}],67:[function(require,module,exports){
"use strict";

const ul = require("ul")
    , flowTypes = require("engine-flow-types")
    , flowComponent = require("./flow-component")
    , iterateObject = require("iterate-object")
    , setOrGet = require("set-or-get")
    , typpy = require("typpy")
    ;

class Instance {

    /**
     * Instance
     * Create a new `Instance` (Engine Instance) instance.
     *
     * @name Instance
     * @function
     * @param {Object} data The raw Engine instance object.
     * @param {Object} options An object containing the following fields:
     *
     *  - `enny` (Enny): The `Enny` instance.
     *
     * @return {Instance} The `Instance` instance.
     */
    constructor (data, options) {
        this._ = ul.merge(data, {
            flow: {}
        });
        this.flow = {};
        this.name = data.name;
    }

    setName (name) {
        this.name = name;
        this._.name = name;
    }

    /**
     * addFlow
     * Adds a set of FlowElements to the current instance.
     *
     * @name addFlow
     * @function
     * @param {Array} flow An array of human-readable objects, interpreted by `FlowElement`.
     * @param {Object} options The object passed to `FlowElement`.
     */
    on (eventName, component, error, end) {

        // on([Listener]);
        if (typpy(eventName, flowTypes.Listener)) {
            this.flow[eventName.event_name] = eventName;
            return eventName;
        }

        // on("event", {...}, "...", "...");
        var listener = setOrGet(
            this.flow
          , eventName
          , new flowTypes.Listener(eventName, error, end)
        );

        if (component) {
            let add = function (c) {
                listener.addData(flowComponent(c));
            };

            if (Array.isArray(component)) {
                component.forEach(c => add(c));
            } else {
                add(component);
            }
        }

        return listener;
    }

    /**
     * toObject
     * Converts the internal composition into object format.
     *
     * @name toObject
     * @function
     * @return {Object} The prepared composition as object.
     */
    toObject () {
        var res = ul.clone(this._);
        res.flow = {};
        iterateObject(this.flow, (cListener, name) => {
            res.flow[name] = cListener.enny();
        });

        return res;
    }
}

module.exports = Instance;

},{"./flow-component":66,"engine-flow-types":51,"iterate-object":71,"set-or-get":76,"typpy":77,"ul":78}],68:[function(require,module,exports){
var flowTypes = require("engine-flow-types")

flowTypes.Emit.prototype.enny = function () {

    var ops = {
        to: this.to
      , net: this.net
    };

    if (!ops.to) {
        delete ops.to;
    }

    if (!ops.net) {
        delete ops.net;
    }

    var ev = this.constructor.types[
        this.leaking ? "leaking" : "normal"
    ].char + this.event;

    if (ops.to || ops.net) {
        return [ev, ops];
    }

    return ev;
};

flowTypes.DataHandler.prototype.enny = function () {
    var v = this.get()
      , types = this.constructor.types
      ;

    v[0] = types[this.once ? "once" : "normal"].char + v[0];

    return this.toFlow(v);
};

flowTypes.StreamHandler.prototype.enny = function () {
    var v = this.get()
      , types = this.constructor.types
      ;

    v[0] = types[this.leaking ? "leaking" : "normal"].char + v[0];

    return this.toFlow(v);
};

flowTypes.Listener.prototype.enny = function () {
    var event = {
        d: this.data.map(c => c.enny())
      , r: this.error
      , e: this.end
    };
    return event;
};

},{"engine-flow-types":51}],69:[function(require,module,exports){
"use strict";

// Dependencies
var ul = require("ul")
  , ObjectMap = require("map-o")
  , iterateObject = require("iterate-object")
  , Instance = require("./constructors/instance")
  , addEnny = require("./generators")
  ;

class Enny {
    /**
     * Enny
     * Create a new Enny instance
     *
     * @name Enny
     * @function
     * @return {Enny} The `Enny` instance.
     */
    constructor () {
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

    /**
     * toObject
     * Converts the internal composition into an object.
     *
     * @name toObject
     * @function
     * @return {Object} The modified composition.
     */
    toObject () {
        return JSON.parse(JSON.stringify(this));
    }

    /**
     * renameInstance
     * Renames the specified instance. This will update the instance references in the entire app.
     *
     * @name renameInstance
     * @function
     * @param {String} oldName The old instance name.
     * @param {String} newName The new instance name.
     * @param {Function} cb The callback function.
     */
    renameInstance (oldName, newName, cb) {

        cb = cb || function (err) {
            if (err) { throw err; }
            return arguments;
        }

        // Validate the old and new names
        if (typeof oldName !== "string") {
            return cb(new TypeError("The old instance name should be a string."));
        }

        if (typeof newName !== "string") {
            return cb(new TypeError("The new instance name should be a string."));
        }

        // Get the instance to rename
        var instanceToRename = this.instances[oldName];
        if (!instanceToRename) {
            return cb(new Error("There is no such instance."));
        }

        // Check for existence of instances with the new name
        if (this.instances[newName]) {
            return cb(new Error("There is already an instance with this new name: " + newName));
        }

        // Change the instance name
        instanceToRename.setName(newName);

        var changedInstances = {};
        var renameFlow = function (flow, cInstance) {
            if (!Array.isArray(flow)) { return; }
            iterateObject(flow, function (cElement) {
                iterateObject(cElement._, function (cComponent) {
                    if (cComponent.data.instance === oldName) {
                        changedInstances[cInstance._.name] = true;
                        cComponent.data.to = newName;
                    }
                });
            });
        };

        // Change the instance name in flows
        iterateObject(this.instances, function (cInstance) {
            if (cInstance._.name === oldName) { return; }
            renameFlow(cInstance._.flow, cInstance);
            renameFlow(Object(cInstance._.client).flow, cInstance);
        });

        // Change the cached instance
        this.instances[newName] = instanceToRename;
        delete this.instances[oldName];

        return cb(null, changedInstances);
    }

    /**
     * toJSON
     * This function is called internally when `JSON.stringify`-ing the things.
     *
     * @name toJSON
     * @function
     * @return {Object} The object that should be stringified.
     */
    toJSON () {
        var self = this;
        var obj = {};
        Object.keys(self.instances).forEach(function (name) {
            obj[name] = self.instances[name]._;
        });
        return obj;
    }

    /**
     * addInstance
     * Adds a new instance.
     *
     * @name addInstance
     * @function
     * @param {Object} ins The Engine instance you want to add.
     * @return {Instance} The instance object.
     */
    addInstance (ins) {
        ins = this.Instance(ins);
        this.instances[ins._.name] = ins;
        return ins;
    }

    toObject () {
        var instances = {};
        iterateObject(this.instances, (cIns, name) => {
            instances[name] = cIns.toObject();
        });
        return instances;
    }
}

Enny.Instance = Instance;

module.exports = Enny;

},{"./constructors/instance":67,"./generators":68,"iterate-object":71,"map-o":72,"ul":78}],70:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11,"typpy":77}],71:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"dup":53}],72:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"dup":54,"iterate-object":71,"ul":73}],73:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"_process":3,"deffy":74,"dup":21,"typpy":75}],74:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11,"typpy":75}],75:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"dup":23}],76:[function(require,module,exports){
// Dependencies
var Deffy = require("deffy");

/**
 * SetOrGet
 * Sets or gets an object field value.
 *
 * @name SetOrGet
 * @function
 * @param {Object|Array} input The cache/input object.
 * @param {String|Number} field The field you want to update/create.
 * @param {Object|Array} def The default value.
 * @return {Object|Array} The field value.
 */
function SetOrGet(input, field, def) {
    return input[field] = Deffy(input[field], def);
}

module.exports = SetOrGet;

},{"deffy":70}],77:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"dup":27}],78:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"_process":3,"deffy":79,"dup":21,"typpy":80}],79:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11,"typpy":80}],80:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"dup":23}],81:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"dup":26,"typpy":85}],82:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"dup":53}],83:[function(require,module,exports){
arguments[4][33][0].apply(exports,arguments)
},{"_process":3,"deffy":84,"dup":33}],84:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11,"typpy":85}],85:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"dup":27}],86:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"_process":3,"deffy":87,"dup":21,"typpy":88}],87:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11,"typpy":88}],88:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"dup":23}],89:[function(require,module,exports){
module.exports = {
    turquoise: "#1abc9c"
  , emerland: "#2ecc71"
  , peterRiver: "#3498db"
  , amethyst: "#9b59b6"
  , wetAsphalt: "#34495e"
  , greenSea: "#16a085"
  , nephritis: "#27ae60"
  , belizeHole: "#2980b9"
  , wisteria: "#8e44ad"
  , midnightBlue: "#2c3e50"
  , sunFlower: "#f1c40f"
  , carrot: "#e67e22"
  , alizarin: "#e74c3c"
  , clouds: "#ecf0f1"
  , concrete: "#95a5a6"
  , orange: "#f39c12"
  , pumpkin: "#d35400"
  , pomegranate: "#c0392b"
  , silver: "#bdc3c7"
  , asbestos: "#7f8c8d"
};

},{}],90:[function(require,module,exports){
module.exports = [
    [ 26,  188, 156, "#1abc9c", "turquoise"    ]
  , [ 46,  204, 113, "#2ecc71", "emerland"     ]
  , [ 52,  152, 219, "#3498db", "peter-river"  ]
  , [ 155, 89,  182, "#9b59b6", "amethyst"     ]
  , [ 52,  73,  94,  "#34495e", "wet-asphalt"  ]
  , [ 22,  160, 133, "#16a085", "green-sea"    ]
  , [ 39,  174, 96,  "#27ae60", "nephritis"    ]
  , [ 41,  128, 185, "#2980b9", "belize-hole"  ]
  , [ 142, 68,  173, "#8e44ad", "wisteria"     ]
  , [ 44,  62,  80,  "#2c3e50", "midnight-blue"]
  , [ 241, 196, 15,  "#f1c40f", "sun-flower"   ]
  , [ 230, 126, 34,  "#e67e22", "carrot"       ]
  , [ 231, 76,  60,  "#e74c3c", "alizarin"     ]
  , [ 236, 240, 241, "#ecf0f1", "clouds"       ]
  , [ 149, 165, 166, "#95a5a6", "concrete"     ]
  , [ 243, 156, 18,  "#f39c12", "orange"       ]
  , [ 211, 84,  0,   "#d35400", "pumpkin"      ]
  , [ 192, 57,  43,  "#c0392b", "pomegranate"  ]
  , [ 189, 195, 199, "#bdc3c7", "silver"       ]
  , [ 127, 140, 141, "#7f8c8d", "asbestos"     ]
];

},{}],91:[function(require,module,exports){
// Dependencies
var Colors = require("./colors")
  , ColorNames = require("./color-names")
  ;

/**
 * FlatColors
 * Finds the nearest flat color for rgb and hex inputs.
 *
 * @name FlatColors
 * @function
 * @param {String|Number|Array|undefined} r The color as string in hex format, the *red* value or the rgb passed as array. If `undefined`, a random color will be returned.
 * @param {Number} g The green value.
 * @param {Number} b The blue value.
 * @return {Array} An array containing the rgb values of the flat color which was found.
 */
function FlatColors(r, g, b) {

    if (r === undefined) {
        return Colors[Math.floor(Math.random() * Colors.length)];
    }

    if (typeof r === "string" && r.charAt(0) === "#") {
        return FlatColors(FlatColors.toRgb(r));
    }

    var rgb = Array.isArray(r) ? r : [ r, g, b ]
      , best = null
      ;

    for (var i = 0; i < Colors.length; ++i) {
        var d = distance(Colors[i], rgb)
        if (!best || d <= best.distance) {
            best = { distance : d, index : i };
        }
    }

    return Colors[best.index];
}

/**
 * toRgb
 * Converts a hex format color into rgb.
 *
 * @name toRgb
 * @function
 * @param {String} hex The color in the hex format.
 * @return {Array|null} The rgb array or null.
 */
FlatColors.toRgb = function (hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16)
      , parseInt(result[2], 16)
      , parseInt(result[3], 16)
    ] : null;
};

FlatColors.colors = Colors;
FlatColors._ = ColorNames;

function distance (a, b) {
    return Math.sqrt(
        Math.pow(a[0] - b[0], 2)
      + Math.pow(a[1] - b[1], 2)
      + Math.pow(a[2] - b[2], 2)
    )
}

module.exports = FlatColors;

},{"./color-names":89,"./colors":90}],92:[function(require,module,exports){
/**
 * Idy
 * Generates a random id and potentially unique.
 *
 * @name Idy
 * @function
 * @param {Number} length The id length (default: 10).
 * @return {String} The generated id.
 */
function Idy(length) {
    length = length || 10;
    return Math.random().toString(35).substr(2, length);
}

module.exports = Idy;

},{}],93:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"dup":53}],94:[function(require,module,exports){
// Dependencies
const iterateObject = require("iterate-object");

/**
 * mapObject
 * Array-map like for objects.
 *
 * @name mapObject
 * @function
 * @param {Object} obj The input object.
 * @param {Function} fn A function returning the field values.
 * @param {Boolean|Object} clone If `true`, the input object will be cloned.
 * If `clone` is an object, it will be used as target object.
 * @return {Object} The modified object.
 */
function mapObject(obj, fn, clone) {
    var dst = clone === true ? {} : clone ? clone : obj;
    iterateObject(obj, (v, n, o) => {
        dst[n] = fn(v, n, o);
    });
    return dst;
}

module.exports = mapObject;

},{"iterate-object":95}],95:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"dup":53}],96:[function(require,module,exports){
const moduloN = require("modulo-n");

/**
 * numberly
 *
 * @name numberly
 * @function
 * @param {String} input The input string.
 * @param {Number} min An optional minimum range.
 * @param {Number} max An optional maximum range.
 * @return {Number} The pseudo-hash for the input string, as number.
 */
module.exports = function numberly(input, min, max) {

    var sum = 0
      , i = 0
      ;

    for (; i < input.length; ++i) {
        sum += input.charCodeAt(i);
    }

    if (!min && !max) {
        return sum;
    }

    return moduloN(sum, min, max);
};

},{"modulo-n":97}],97:[function(require,module,exports){
/**
 * moduloN
 * Returns a number that will be unique for a specific `n` and range.
 *
 * @name moduloN
 * @function
 * @param {Number} n The input number.
 * @param {Number} min The minimum number in the range.
 * @param {Number} max The maximum number in the range.
 * @return {Number} A number that will greater or equal to `min` but
 * lower than `max` and will be always the same for the same range and same `n`.
 */
module.exports = function moduloN(n, min, max) {
    return n % (max - min) + min;
};

},{}],98:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"dup":27}],99:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"_process":3,"deffy":100,"dup":21,"typpy":101}],100:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11,"typpy":101}],101:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"dup":23}]},{},[10]);
