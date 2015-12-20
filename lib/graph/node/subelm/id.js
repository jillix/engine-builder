"use strict";

// Dependencies
const deffy = require("deffy")
    , typpy = require("typpy")
    ;

// Constants
const SEPARATOR = "__";

class SubElmId {

    /**
     * SubElmId
     * Creates a new instance of `SubElmId`.
     *
     * @name SubElmId
     * @function
     * @param {Type|SubElement} type The subelement type or the subelement itself.
     * @param {String} name The subelement name.
     * @param {NodeId} parent The subelement parent id.
     * @return {SubElmId} The `SubElmId` instance.
     */
    constructor (type, name, parent) {

        if (typpy(type, "subelm")) {
            parent = name;
            name = type.name;
            this.index = type.index;
            type = type.type;
        }

        if (parent.id) {
            parent = parent.id;
        }

        this.index = deffy(this.index, 0);
        this.type = type;
        this.name = name;
        this.parentId = parent;
    }

    /**
     * toString
     * Stringifies a subelement id.
     *
     * @name toString
     * @function
     * @param {Boolean} noIndex If `true`, the index value will be ommited from the stringified id.
     * @return {String} The subelement id.
     */
    toString (noIndex) {
        return [this.type, this.parentId, this.name, noIndex ? "" : this.index].join(SEPARATOR);
    }
}

module.exports = SubElmId;
