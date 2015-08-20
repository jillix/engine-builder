// Dependencies
var Enny = require("enny");

module.exports = function (input) {
    if (input.serverMethod || Enny.TYPES(input.type, Enny.TYPES.emit)) {
        return Enny.TYPES.listener;
    }
    return input.type;
};
