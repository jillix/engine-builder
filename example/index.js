// Dependencies
const EngineBuilder = require("../lib");

var eb = new EngineBuilder(`${__dirname}/engine-test`);
eb.getGraph(function (err, data) {
    console.log(err || JSON.stringify(data, null, 4));
});
