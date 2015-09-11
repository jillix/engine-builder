var Typpy = require("typpy");

module.exports = function getListener (event, index, instance, isServer) {
    if (Typpy(event, Object)) {
        return getListener(event.name, event.index, instance, event.server);
    }
    debugger
};
