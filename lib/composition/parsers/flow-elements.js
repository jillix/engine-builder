// Dependencies
var ParseFlowComponent = require("./flow-component")
  , IterateObject = require("iterate-object")
  , SetOrGet = require("set-or-get")
  ;

module.exports = function (_input, instName) {

    var out = {};

    IterateObject(_input, function (elm) {
        var ev = SetOrGet(out, elm[0], []);
        var p = [];
        IterateObject(elm.slice(1), function (comp) {
            p.push(ParseFlowComponent(comp, instName));
        });
        ev.push(p);
    });

    return out;
};
