// Dependencies
var Enny = require("enny");

module.exports = function (input) {
    if (input.serverMethod || TYPES(input.type, TYPES.emit)) {
        return TYPES.listener;
    }
    return input.type;
};
