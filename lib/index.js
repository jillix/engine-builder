// Dependencies
var Typpy = require("typpy")
  , NodeElm = require("./composition/node")
  , Composition = require("./composition")
  , Enny = require("enny")
  ;

function Parser(input, colors, positions, moduleInfo, callback) {

    var comp = new Composition()
      , instances = Object.keys(input)
      , i = 0
      , ii = 0
      , iii = 0
      , cInstance = null
      , cNode = null
      , cColor = null
      , cPos = null
      , cFlow = null
      , cListener = null
      , cListenerSubElm = null
      , nameToNode = {}
      , cComponent = null
      , nComponent = null
      , cComponentElm = null
      , nComponentElm = null
      ;

    if (!instances.length) {
        return callback(null, composition);
    }

    // Add the instance bubbles
    for (; i < instances.length; ++i) {
        cInstance = input[instances[i]];
        nameToNode[cInstance.name] = cNode = comp.addNode(cInstance);
        !!(cColor = colors[cNode.id]) && cNode.color(cColor);
        !!(cPos = positions[cNode.id]) && cNode.position(cPos);
    }

    // Flow
    for (i = 0; i < instances.length; ++i) {
        cInstance = input[instances[i]];
        if (!Typpy(cInstance.client, Object) || !Typpy(cInstance.client.flow, Array)) { continue; }
        cNode = nameToNode[cInstance.name];
        cFlow = Enny.parseFlow(cInstance.client.flow, cInstance.name);
        for (ii = 0; cFlow.length; ++ii) {
            cListener = cFlow[ii];
            cListenerSubElm = cNode.addSubElement({
                type: Enny.TYPES.listener,
                label: cListener.on
            });
            // TODO
            function next() {

            }
            next(cListenerSubElm,
            cComponent = cListener._[0];
            if (cComponent.
            cComponentElm = nameToNode[
            for (iii = 1; iii < cListener._.length; ++iii) {

            }
        }
    }

    callback(null, comp);
}

module.exports = Parser;
