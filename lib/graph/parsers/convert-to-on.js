// Dependencies
var Enny = require("enny");

/**
 * convertToOn
 * For given input, this function returns the target type.
 *
 * @name convertToOn
 * @function
 * @param {FlowComponent} input The flow component.
 * @return {Type} A `Type` value which is listener in case the component is client-server call or emit, otherwise the input type.
 */
module.exports = function (input) {
    if (input.serverMethod || Enny.TYPES(input.type, Enny.TYPES.emit) || Enny.TYPES(input.type, Enny.TYPES.link)) {
        return Enny.TYPES.listener;
    }
    return input.type;
};
