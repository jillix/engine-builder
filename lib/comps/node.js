"use strict";

const Idy = require("idy");

class BuilderNode {
    constructor (data) {
        // TODO
        this.id = Idy();
        this.label = data.name;
        this.name = data.name;
        this.raw = data;
    }
    toString () {
        return this.id;
    }
}

module.exports = NodeElm;
