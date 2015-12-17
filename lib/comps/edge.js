"use strict";

const Idy = require("idy");

/**
 * BuilderEdge
 *
 * @name BuilderEdge
 * @function
 * @param {Object} input An object containing the following fields:
 *
 *  - `source` (Element|SubElement): The source element.
 *  - `target` (Element|SubElement): The target element.
 *  - `classes` (Array): An array with the line classes (they will be appended in the HTML).
 *
 * @return {BuilderEdge} The `BuilderEdge` instance.
 */
class BuilderEdge {
    constructor (input) {
        this.source = input.source;
        this.target = input.target;
        // TODO
        this.id = Idy();
    }
}

module.exports = BuilderEdge;
