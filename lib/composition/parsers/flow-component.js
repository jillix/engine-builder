// Dependencies
var ParseMethod = require("./method")
  , Enny = require("enny")
  , Ul = require("ul")
  , Typpy = require("typpy")
  ;

module.exports = function (_input, instName) {
    var input = Ul.clone(_input);

    if (Typpy(input, String)) {
        input = [input];
    }

    var output = {}
      , eP = null
      , mP = null
      ;

    // Load
    if (input[0] === Enny.TYPES.load.handler) {
        output.type = Enny.TYPES.load;
        output.args = input.slice(1);
    // Emit/link
    } else if ((eP = ParseMethod(input[0], instName)).method === "flow") {
        if (Enny.TYPES((mP = ParseMethod(input[1], instName)).type, Enny.TYPES.link)) {
            output = mP;
            output.type = Enny.TYPES.link;
            output.serverMethod = output.method;
            output.event = output.method;
        } else {
            output = eP;
            output.type = Enny.TYPES.emit;
            output.event = input[1];
        }
    }

    // Stream handler
    if (!output.type) {
        output = ParseMethod(input[0], instName);
        output.args = input.slice(1);
    }

    return output;
};
