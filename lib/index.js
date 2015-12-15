"use strict";

// Dependencies
var Typpy = require("typpy")
  , NodeElm = require("./composition/node")
  , Composition = require("./composition")
  , Ul = require("ul")
  , EngineParser = require("engine-parser")
  ;

class EngineBuilder extends EngineParser {
    getGraph (level) {

        // Levels
        //  - 1 Big bubbles, connected based on events
        //  - 2 Big
        //  - 3

        var graph = {
            nodes: []
          , lines: []
        };

        this.parse((err, parsed) => {

            debugger
        });
    }
}

module.exports = EngineBuilder;
