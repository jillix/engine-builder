// Dependencies
var EngineTools = require("engine-tools")
  , Typpy = require("typpy")
  ;

function Parser(input, callback) {
    if (Typpy(input, String)) {
        return EngineTools.getComposition(input, { iName: true }, function (err, data) {
            if (err) { return callback(err); }
            Parser(data, callback);
        });
    }
    var composition = {
        nodes: {},
        lines: {}
    };
    callback(null, composition);
}

module.exports = Parser;
