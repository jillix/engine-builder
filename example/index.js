// Dependencies
var Parser = require("../lib")
  , EngineTools = require("engine-tools")
  ;

// Get the composition
EngineTools.getComposition("service-dev", { iName: true }, function (err, data) {

    if (err) {
        return console.log("Failed to get the composition.");
    }

    // Parse it
    Parser(data, {}, {}, {}, function (err, data) {
        console.log(err, data);
    });
});
