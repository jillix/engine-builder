var Typpy = require("typpy")
  , Deffy = require("deffy")
  , IterateObject = require("iterate-object")
  ;

module.exports = function getListener (event, index, instance, isServer) {
    if (Typpy(event, Object)) {
        return getListener(event.name, event.index, index, event.server);
    }

    var flow = Deffy(isServer ? instance.flow : Object(instance.client).flow, [])
      , result = null
      ;

    IterateObject(flow, function (value) {
        if (value[0] === event) {
            --index;
        }
        if (index === -1) {
            result = value;
            return false;
        }
    });

    return result;
};
