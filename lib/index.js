"use strict";

// Dependencies
const EngineParser = require("engine-parser")
    , Graph = require("./graph")
    ;

class EngineBuilder extends EngineParser {
    /**
     * getGraph
     * Parses and sends back the application builder data. Note the `EngineBuilder` class
     * is extended from `EngineParser`. So, all the methods available in `EngineParser`
     * are accessible here as well.
     *
     * @name getGraph
     * @function
     * @param {Object} options The options object.
     * @param {Object} data An object containing the following fields:
     *
     *  - `app` (String): The application name (**todo**: this is currently hardcoded as `service`.
     *
     * @param {Function} next The `next` handler used in flow.
     */
    getGraph (fn) {
        this.parse((err, parsed) => {
            if (err) { return fn(err); }
            fn(null, new Graph(parsed).get());
        });
    }
}

module.exports = EngineBuilder;
