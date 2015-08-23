// Dependencies
var Enny = require("enny");

module.exports = function (source, target) {

    if (!source.id.parentId.isServer && target.id.parentId.isServer) {
        return "link-in";
    }

    // * -> error
    if (Enny.TYPES(target.type, Enny.TYPES.errorHandler)) {
        // "line-"
        // <path class="line-error-in"...>
        return "error-in";
    }

    // error -> *
    if (Enny.TYPES(source.type, Enny.TYPES.errorHandler)) {
        return "error-out";
    }

    // data -> *
    if (Enny.TYPES(source.type, Enny.TYPES.dataHandler)) {
        return "data-out";
    }

    return "normal";
};

