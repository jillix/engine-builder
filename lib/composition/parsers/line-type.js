// Dependencies
var Enny = require("enny");

module.exports = function (source, target) {
    // * -> error
    if (Enny.TYPES(target.type, TYPES.errorHandler)) {
        return "error-in";
    }

    // error -> *
    if (Enny.TYPES(source.type, TYPES.errorHandler)) {
        return "error-out";
    }

    // data -> *
    if (Enny.TYPES(source.type, TYPES.dataHandler)) {
        return "data-out";
    }

    return "normal";
};

