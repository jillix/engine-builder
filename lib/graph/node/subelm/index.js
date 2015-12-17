"use strict";

// Dependencies
const Deffy = require("deffy")
    , Typpy = require("typpy")
    , Enny = require("enny")
    , SubElmId = require("./id")
    ;

class SubElm {
    /**
     * SubElm
     * Creates a `SubElm` instance.
     *
     * @name SubElm
     * @function
     * @param {Type} type The subelement type.
     * @param {Object} data An object containing the following fields:
     * @param {Element} parent The element this subelement belongs to.
     * @return {SubElm} The `SubElm` instance.
     */
    constructor (type, data, parent) {
        if (Typpy(data, SubElm)) {
            return data;
        }
        if (typeof type === "string") {
            type = Enny.TYPES[type];
        }
        this.index = 0;
        if (Typpy(data.index, Number)) {
            this.index = data.index;
        }
        this.icon = type.icon;
        this.name = SubElm.Name(data);
        this.label = Deffy(data.label, this.name);
        this.disableInput = data.disableInput;
        this.type = type.type;
        this.id = new SubElmId(this, parent.id);
        this.lines = {};
    }
}

/**
 * Name
 * Gets the name from various inputs.
 *
 * @name Name
 * @function
 * @param {Object} input An object containing one of the following fields:
 *
 *  - `name`
 *  - `event`
 *  - `serverMethod`
 *  - `method`
 *
 * @return {String} The subelement name.
 */
SubElm.name = function (input) {
    return input.name || input.event || input.serverMethod || input.method;
};

SubElm.Id = SubElmId;

module.exports = SubElm;
