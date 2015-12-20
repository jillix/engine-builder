# engine-builder

Engine composition parser.

## Installation

```sh
$ npm i --save engine-builder
```

## Example

```js
// Dependencies
const EngineBuilder = require("engine-builder");

var eb = new EngineBuilder(`${__dirname}/engine-test`);
eb.getGraph(function (err, data) {
    console.log(err || JSON.stringify(data, null, 4));
});
```

## How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].

## Where is this library used?
If you are using this library in one of your projects, add it in this list. :sparkles:

## License

[MIT][license] © [jillix][website]

[license]: http://showalicense.com/?fullname=jillix%20%3Ccontact%40jillix.com%3E%20(http%3A%2F%2Fjillix.com)&year=2015#license-mit
[website]: http://jillix.com
[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md