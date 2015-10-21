// Dependencies
var ParseFlowElements = require("./flow-elements");

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
    return _input.map(function (c) {
        return ParseFlowElements(c, instName, true);
    });
};
