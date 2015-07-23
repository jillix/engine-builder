var EngineTools = require("engine-tools")
  , Typpy = require("typpy")
  ;

function Parser(input, callback) {
    if (Typpy(input, String)) {
        return EngineTools.getComposition(input, { iName: true }, Parser);
    }
    var composition = {
        nodes: {},
        lines: {}
    };
}
