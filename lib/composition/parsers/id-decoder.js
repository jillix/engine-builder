module.exports = function idDecoder (input) {
    var index = null
      , token = input.substring(0, (index = input.indexOf("_")))
      , splits = null
      , result = {
            name: null
          , type: token
          , index: null
          , server: null
          , id: input
          , parent: null
        }
      ;

    input = input.substring(index + 1);

    // We got an instance
    switch (result.type) {
        case "instance":
            token = input.substring(0, (index = input.indexOf("_")))
            input = input.substring(index + 1);
            result.server = ({ Server: true, Client: false })[token];
            result.name = input;
            break;
        case "listener":
        case "dataHandler":
        case "errorHandler":
        case "streamHandler":
            splits = input.substring(1).split("__");
            result.parent = idDecoder(splits[0]);
            result.name = splits[1];
            result.index = parseInt(splits[2]);
            break;
    }

    return result;
};
