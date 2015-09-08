// Dependencies
var Typpy = require("typpy")
  , Deffy = require("deffy")
  , SubElm = require("./subelm")
  , Parsers = require("../parsers")
  , Enny = require("enny")
  , IterateObject = require("iterate-object")
  ;

// Constants
var INSTANCE_PREFIX = "instance"
  , SEPARATOR = "_"
  ;

/**
 * NodeId
 * Creates a new `NodeId` instance.
 *
 * @name NodeId
 * @function
 * @param {NodeElm} input The node instance.
 * @param {Boolean} isServer If `true`, the node is on the server side, otherwise on the client.
 * @return {NodeId} The `NodeId` instance.
 */
function NodeId(input, isServer) {
    isServer = Deffy(isServer, !!input.isServer);
    this.isServer = isServer;
    this.side = ["Client", "Server"][Number(isServer)];
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
NodeId.prototype.toString = function () {
    return [INSTANCE_PREFIX, this.side, this.name].join(SEPARATOR);
};

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
 * @param {Boolean} isServer If `true`, the node is on the server side, otherwise on the client.
 * @return {NodeElm} The `NodeElm` instance.
 */
function NodeElm(data, isServer) {
    isServer = Deffy(isServer, false);
    this.id = new NodeId(data, isServer);
    this.icon = Deffy(data.icon, "&#xf0c0");
    this.subelms = {};
    this.label = data.name + " (" + this.id.side + ")";
    this.domains = [];
    this.name = data.name;
    this.flow = Deffy(isServer ? data.flow : (data.client && data.client.flow), []);
    this.load = Deffy(isServer ? data.load : (data.client && data.client.load), []);
    this.pFlow = Parsers.FlowElements(this.flow, this.name);
    this.raw = data;
}

NodeElm.Id = NodeId;

/**
 * hasFlow
 * Checks if the node has flow or not.
 *
 * @name hasFlow
 * @function
 * @return {Boolean} `true` if the node has flow, `false` otherwise.
 */
NodeElm.prototype.hasFlow = function () {
    return !!this.flow.length;
};

/**
 * setColor
 * Sets or gets the element color.
 *
 * @name setColor
 * @function
 * @param {String} c The new color.
 * @return {String} The set or current color.
 */
NodeElm.prototype.setColor = function (c) {
    return (this.color = [this.color, c][arguments.length]);
};

/**
 * position
 * Sets the element position.
 *
 * @name position
 * @function
 * @param {Number} x The x coordinate.
 * @param {Number} y The y coordinate.
 */
NodeElm.prototype.position = function (x, y) {
    if (Typpy(x, Number) && Typpy(y, Number)) {
        return this.position({ x: x, y: y });
    }
    if (!Typpy(x, Object) || !Typpy(x.x, Number) || !Typpy(x.y, Number)) {
        return this.pos;
    }
    this.pos = x;
};

/**
 * addSubElement
 *
 * @name addSubElement
 * @function
 * @param {Type} type The subelement type.
 * @param {Object} elm The subelement data.
 * @return {SubElement} The subelement instance.
 */
NodeElm.prototype.addSubElement = function (type, elm) {
    if (Typpy(type, SubElm)) {
        elm = type;
    } else {
        elm = new SubElm(type, elm, this);
    }
    if (this.subelms[elm.id]) {
        console.warn("Override", elm);
    }
    return (this.subelms[elm.id] = elm);
};

/**
 * getListeners
 * Gets the listners for a specific event.
 *
 * @name getListeners
 * @function
 * @param {String} event The event you want to get the listeners for.
 * @return {Array} An array of subelements (listeners).
 */
NodeElm.prototype.getListeners = function (event) {
    var elm = new SubElm(Enny.TYPES.listener.name, {
            event: event
        }, this)
      , id = elm.id.toString(true)
      , bubbles = []
      ;

    IterateObject(this.subelms, function (cSubelm) {
        if (cSubelm.id.toString(true) === id) {
            bubbles.push(cSubelm);
        }
    });

    return bubbles;
};

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
NodeElm.prototype.getOrAddSubElm = function (type, _elm) {
    var elm = new SubElm(type, _elm, this);
    if (this.subelms[elm.id]) {
        return this.subelms[elm.id];
    }
    return this.addSubElement(elm);
};

module.exports = NodeElm;
