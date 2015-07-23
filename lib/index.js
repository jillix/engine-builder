// Dependencies
var Typpy = require("typpy")
  , NodeElm = require("./composition/node")
  , Composition = require("./composition")
  ;

function Parser(input, colors, positions, moduleInfo, callback) {

    var comp = new Composition()
      , instances = Object.keys(input)
      , i = 0
      , cInstance = null
      , cNode = null
      , cColor = null
      , cPos = null
      ;

    if (!instances.length) {
        return callback(null, composition);
    }

    // Add the instance bubbles
    for (; i < instances.length; ++i) {
        cInstance = input[instances[i]];
        cNode = comp.addNode(cInstance);
        !!(cColor = colors[cNode.id]) && cNode.color(cColor);
        !!(cPos = positions[cNode.id]) && cNode.position(cPos);
    }

    callback(null, comp);
}

module.exports = Parser;
