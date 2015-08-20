var Enny = require("enny");

// instance/method
// !instance/method
// >instance/method
// :instance/method
// method
module.exports = function (input, defaultIns) {
    var output = {
        instance: defaultIns,
        type: Enny.TYPES.streamHandler
    };
    switch (input.charAt(0)) {
        case "!":
            output.type = Enny.TYPES.errorHandler;
            input = input.substr(1);
            break;
        case ":":
            output.type = Enny.TYPES.dataHandler;
            input = input.substr(1);
            break;
        case ">":
            output.disableInput = true;
            output.type = Enny.TYPES.streamHandler;
            input = input.substr(1);
            break;
        case "@":
            output.type = Enny.TYPES.link;
            input = input.substr(1);
            break;
        default:
            break;
    }

    var splits = input.split("/");
    if (splits.length === 2) {
        output.instance = splits[0];
        output.method = splits[1];
    } else {
        output.method = splits[0];
    }
    return output;
};
