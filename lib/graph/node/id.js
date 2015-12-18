"use strict";

const Deffy = require("deffy");

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
    constructor (input, isServer) {
        isServer = Deffy(isServer, !!input.isServer);
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
