var EngineParser = require("../../lib");

var e = new EngineParser({
    "A": {
        name: "A"
      , client: {
            flow: [
                [
                    "listener"
                  , ":data-handler"
                ]
            ]
        }
    }
}, null, null, function (err, data) {
    console.log(data);
});
