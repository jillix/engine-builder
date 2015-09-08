// Dependencies
var Deffy = require("deffy")
  , Typpy = require("typpy")
  , Enny = require("enny")
  ;

// Constants
var SEPARATOR = "__";

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
function SubElmId(type, name, parent) {

    if (Typpy(type, SubElm)) {
        parent = name;
        name = type.name;
        this.index = type.index;
        type = type.type;
    }

    this.index = Deffy(this.index, 0);
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
SubElmId.prototype.toString = function (noIndex) {
    return [this.type, this.parentId, this.name, noIndex ? "" : this.index].join(SEPARATOR);
};

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
function SubElm(type, data, parent) {
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
SubElm.Name = function (input) {
    return input.name || input.event || input.serverMethod || input.method;
};

SubElm.Id = SubElmId;

module.exports = SubElm;
