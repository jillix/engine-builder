// Dependencies
var Typpy = require("typpy")
  , NodeElm = require("./composition/node")
  , Composition = require("./composition")
  ;

function Parser(input, positions, moduleInfo, callback) {

    var comp = new Composition()
      , instances = Object.keys(input)
      , i = 0
      , cInstance = null
      ;

    if (!instances.length) {
        return callback(null, composition);
    }

    for (; i < instances.length; ++i) {
        cInstance = instances[i];
        comp.addNode(cInstance);
    }

    callback(null, comp.prepare());
}

module.exports = Parser;
