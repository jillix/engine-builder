// Dependencies
var Typpy = require("typpy")
  , NodeElm = require("./composition/node")
  , Composition = require("./composition")
  ;

/**
 * Parser
 * Creates a new `Parser` instance.
 *
 * @name Parser
 * @function
 * @param {Object} input The application instances object.
 * @param {Object} appService The application service object.
 * @param {Object} moduleInfo An object containing the module information.
 * @param {Function} callback The callback function.
 * @return {Parser} The `Parser` instance.
 */
function Parser(input, appService, moduleInfo, callback) {

    // Add the instances
    var comp = new Composition({
        instances: input || {}
      , appService: appService || {}
      , moduleInfo: moduleInfo || {}
    })

    comp.parseFlow();
    comp.addConnections();

    callback(null, comp);
}

// TODO This probably is not needed anymore.
if (typeof window === "object") {
    window.EngineParser = Parser;
}

module.exports = Parser;
