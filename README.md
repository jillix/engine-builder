# engine-parser

Engine composition parser.

## Installation

```sh
$ npm i engine-parser
```

## Example

```js
// Dependencies
var Parser = require("engine-parser")
  , EngineTools = require("engine-tools")
  , Typpy = require("typpy")
  , SameTime = require("same-time")
  ;

// Constants
const APP = "service-dev";

SameTime([
    // Instances
    EngineTools.getComposition.bind(EngineTools, APP, { iName: true })
    // Get service file
  , EngineTools.getService.bind(EngineTools, APP)
  , EngineTools.getModuleInfo.bind(EngineTools, APP)
], function (err, data) {
    if (err) { return console.error(err); }
    Parser(data[0], data[1], data[2], {
        handleServer: false
      , parseLines: false
    }, function (err, data) {
        console.log(err, data.prepare());
    });
});
```

## Documentation

### `Parser(input, appService, moduleInfo, callback)`
Creates a new `Parser` instance.

#### Params
- **Object** `input`: The application instances object.
- **Object** `appService`: The application service object.
- **Object** `moduleInfo`: An object containing the module information.
- **Function** `callback`: The callback function.

#### Return
- **Parser** The `Parser` instance.

## How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].

## Where is this library used?
If you are using this library in one of your projects, add it in this list. :sparkles:

## License

See the [LICENSE](/LICENSE) file.

[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md