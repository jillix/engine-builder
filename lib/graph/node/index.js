"use strict";

// Dependencies
const Typpy = require("typpy")
    , Deffy = require("deffy")
    , SubElm = require("./subelm")
    , IterateObject = require("iterate-object")
    , NodeId = require("./id")
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
        this.icon = Deffy(data.icon, "&#xf0c0");
        this.subelms = {};
        this.label = data.name + " (" + this.id.side + ")";
        this.domains = [];
        this.name = data.name;
        this.flow = data.flow;
        this.pFlow = Parsers.FlowElements(this.flow, this.name);
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
        if (Typpy(x, Number) && Typpy(y, Number)) {
            return this.position({ x: x, y: y });
        }
        if (!Typpy(x, Object) || !Typpy(x.x, Number) || !Typpy(x.y, Number)) {
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
    addSubElement (type, elm) {
        if (Typpy(type, SubElm)) {
            elm = type;
        } else {
            elm = new SubElm(type, elm, this);
        }
        if (this.subelms[elm.id]) {
            console.warn("Override", elm);
        }
        return (this.subelms[elm.id] = elm);
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

        IterateObject(this.subelms, function (cSubelm) {
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
