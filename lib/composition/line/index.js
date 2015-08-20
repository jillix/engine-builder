var Deffy = require("deffy")
  , Enny = require("enny")
  , Parsers = require("../parsers")
  ;

function Line(input) {
    this.source = input.source;
    this.target = input.target;
    this.id = this.source.id + "_" + this.target.id + "_" + Math.random();
    this.classes = Deffy(input.classes, []);
    if (!input.classes) {
        this.classes.push(Parsers.LineType(this.source, this.target));
    }
    this.classes = this.classes.map(function (c) {
        return "line-" + c;
    });
}

module.exports = Line;
