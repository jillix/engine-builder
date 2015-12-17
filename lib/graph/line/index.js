// Dependencies
var Deffy = require("deffy")
  , Enny = require("enny")
  , Parsers = require("../parsers")
  , Idy = require("idy")
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
        this.id = this.source.id + "_" + this.target.id + "_" + Idy();
        this.classes = Deffy(input.classes, []);
        if (!input.classes) {
            this.classes.push(Parsers.LineType(this.source, this.target));
        }
        this.classes = this.classes.map(function (c) {
            return "line-" + c;
        });
    }
}

module.exports = Line;