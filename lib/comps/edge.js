"use strict";

const Idy = require("idy");

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
class BuilderEdge {
    constructor (input) {
        this.source = input.source;
        this.target = input.target;
        // TODO
        this.id = Idy();
    }
}

module.exports = Line;
