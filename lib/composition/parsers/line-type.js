// Dependencies
var Enny = require("enny")
  , Deffy = require("deffy")
  ;

/**
 * lineType
 * Returns the line type for given input.
 *
 * @name lineType
 * @function
 * @param {Element|SubElement} source The source (sub)element.
 * @param {Element|SubElement} target The target (sub)element.
 * @param {} target
 * @return {String} The line type.
 */
module.exports = function (source, target) {

    if (!Deffy(source.id.parentId, {}, true).isServer && Deffy(target.id.parentId, {}, true).isServer) {
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
