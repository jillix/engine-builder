// Dependencies
var Parser = require("../lib")
  , EngineTools = require("engine-tools")
  , Typpy = require("typpy")
  , SameTime = require("same-time")
  ;

// Constants
const APP = "sed";

SameTime([
    // Instances
    EngineTools.getComposition.bind(EngineTools, APP, { iName: true })
    // Get service file
  , EngineTools.getService.bind(EngineTools, APP)
  , EngineTools.getModuleInfo.bind(EngineTools, APP)
], function (err, data) {
    if (err) { return console.error(err); }
    Parser(data[0], data[1], data[2], function (err, data) {
        console.log(err, data.prepare());
    });
});

