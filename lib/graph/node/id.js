"use strict";

const Deffy = require("deffy"):

class NodeId {
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
    constructor (input, isServer) {
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
    toString () {
        return [INSTANCE_PREFIX, this.side, this.name].join(SEPARATOR);
    }
}
