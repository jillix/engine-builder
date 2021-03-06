"use strict";

// Dependencies
const deffy = require("deffy")
    , typpy = require("typpy")
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
    constructor (data, parent) {
        this.type = typpy(data);
        this.icon = data.constructor.types.normal.icon;
        this.name = this._name(data);
        this.label = deffy(data.label, this.name);
        this.id = new SubElmId(this, parent.id);
        this.lines = {};
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
    _name (input) {
        return input.name || input.event_name || input.method;
    }
}

SubElm.Id = SubElmId;

module.exports = SubElm;
