"use strict";

// Dependencies
var EngineParser = require("engine-parser")
  , Graph = require("./graph")
  ;

class EngineBuilder extends EngineParser {
    getGraph (fn) {
        this.parse((err, parsed) => {
            debugger
            var g = new Graph();
            debugger
        });
    }
}

module.exports = EngineBuilder;
