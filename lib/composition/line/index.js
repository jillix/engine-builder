function Line(input) {
    this.source = input.source;
    this.target = input.target;
    this.id = this.source.id + "_" + this.target.id + "_" + Math.random();
}

module.exports = Line;
