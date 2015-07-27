// Dependencies
var Typpy = require("typpy")
  , NodeElm = require("./composition/node")
  , Composition = require("./composition")
  , Enny = require("enny")
  ;

function Parser(input, appService, moduleInfo, callback) {

    // Add the instances
    var comp = new Composition({
        instances: input
      , appService: appService
      , moduleInfo: moduleInfo
    })

    comp.parseFlow();
    comp.addConnections();

    callback(null, comp);
}

module.exports = Parser;
