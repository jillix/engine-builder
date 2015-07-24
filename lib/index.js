// Dependencies
var Typpy = require("typpy")
  , NodeElm = require("./composition/node")
  , Composition = require("./composition")
  , Enny = require("enny")
  ;

function Parser(input, colors, positions, moduleInfo, callback) {

    // Add the instances
    var comp = new Composition({
        instances: input
      , colors: colors
      , positions: positions
      , moduleInfo: moduleInfo
    })

    debugger

    // Add the client.flow subelements
    for (i = 0; i < instances.length; ++i) {
        cInstance = input[instances[i]];
        if (!Typpy(cInstance.client, Object) || !Typpy(cInstance.client.flow, Array)) { continue; }
        cNode = nameToNode[cInstance.name];
        cFlow = Enny.parseFlow(cInstance.client.flow, cInstance.name);
        for (ii = 0; ii < cFlow.length; ++ii) {
            cListener = cFlow[ii];

            cListenerSubElm = cNode.addListener({
                name: cListener.on
            });

            for (iii = 1; iii < cListener._.length; ++iii) {
                cFlowElm = cListener._[iii];
                for (var iiii=0; iiii < cFlowElm.length; ++iiii) {
                    cFlowComponent = cFlowElm[iiii];
                    debugger
                }
            }
        }
    }

    callback(null, comp);
}

module.exports = Parser;
