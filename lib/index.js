"use strict";

// Dependencies
var EngineParser = require("engine-parser")
  , Graph = require("./graph")
  ;

class EngineBuilder extends EngineParser {
    getGraph (fn) {
        this.parse((err, parsed) => {
            if (err) { return fn(err); }
            var g = new Graph(parsed);
            debugger
        });
    }
}

module.exports = EngineBuilder;
