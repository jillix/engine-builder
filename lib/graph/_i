"use strict";

const Edge = require("./comps/edge")
    , Node = require("./comps/node")
    ;

class Composition {
    constructor () {
        this.nodes = {};
        this.edges = {};
        this.ids = {};
    }

    /**
     * addNode
     * Adds a new element.
     *
     * @name addNode
     * @function
     * @param {Element|Object} node The new element to add.
     * @param {Boolean} isServer A flag indicated where to add it: on the server or on the client.
     * @return {Element} The added element.
     */
    addNode (node) {
        node = new Node(node);
        return (this.nodes[node.id] = this.ids[node.id] = node);
    }

    /**
     * addEdge
     * Adds a new line.
     *
     * @name addEdge
     * @function
     * @param {Edge|Object} line The line to add.
     * @return {Edge} The added line.
     */
    addEdge (line) {
        line = new EdgeElm(line);
        if (Typpy(line.source, SubElm)) {
            line.source.lines[line.id] = line;
        }
        return (this.lines[line.id] = this.ids[line.id] = line);
    }
}

module.exports = Composition;
