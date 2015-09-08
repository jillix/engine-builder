## Documentation
You can see below the API reference of this module.
# `lib/index.js`
### `Parser(input, appService, moduleInfo, callback)`
Creates a new `Parser` instance.

#### Params
- **Object** `input`: The application instances object.
- **Object** `appService`: The application service object.
- **Object** `moduleInfo`: An object containing the module information.
- **Function** `callback`: The callback function.

#### Return
- **Parser** The `Parser` instance.

# `lib/composition/index.js`
### `Composition(input)`
Creates a new `Composition` instance.

#### Params
- **Object** `input`: An object containing the following fields:
  - `instances` (Object): The application instances.
  - `moduleInfo` (Object): Module related information.
  - `appService` (Object): Application service content (parsed).

#### Return
- **Composition** The `Composition` instance.

### `get(elm)`
Gets a provided element/element id.

#### Params
- **String|Element** `elm`: The element id or the element itself.

#### Return
- **Element** The found element internally.

### `addNode(node, isServer)`
Adds a new element.

#### Params
- **Element|Object** `node`: The new element to add.
- **Boolean** `isServer`: A flag indicated where to add it: on the server or on the client.

#### Return
- **Element** The added element.

### `addLine(line)`
Adds a new line.

#### Params
- **Line|Object** `line`: The line to add.

#### Return
- **Line** The added line.

### `connect(s, t, a)`
Connects two elements.

#### Params
- **Element** `s`: The source element
- **Element** `t`: The target element
- **Object** `a`: Additional fields to be merged.

### `prepare()`
Prepares the data to be used in the builder or other client.

#### Return
- **Object** The prepared composition.

### `addModuleFlow(inst)`
Adds the listener elements.

#### Params
- **Element** `inst`: The current instance.

#### Return
- **Element** The current instance.

### `addInstance(cInstance, isServer)`
Adds a new instance element.

#### Params
- **Element** `cInstance`: The current instance.
- **Boolean** `isServer`: A flag indicated where to add it: on the server or on the client.

### `addInstances(instances)`
Adds the composition instances.

#### Params
- **Object** `instances`: The application instances.

### `parseFlow()`
Parses the flow.

### `addConnections()`
Adds the connections.

# `lib/composition/parsers/convert-to-on.js`
### `convertToOn(input)`
For given input, this function returns the target type.

#### Params
- **FlowComponent** `input`: The flow component.

#### Return
- **Type** A `Type` value which is listener in case the component is client-server call or emit, otherwise the input type.

# `lib/composition/parsers/flow-component.js`
### `flowComponent(_input, instName)`
Parses the flow components.

#### Params
- **Object** `_input`: Raw engine-syntax flow component.
- **String** `instName`: The instance name.

#### Return
- **FlowComponent** The parsed input.

# `lib/composition/parsers/flow-elements.js`
### `flowElements(_input, instName)`

#### Params
- **Arrayt** `_input`: Raw engine-syntax flow elements.
- **String** `instName`: The instance name.

#### Return
- **Object** The parsed flow elements.

# `lib/composition/parsers/line-type.js`
### `lineType(source, target, {})`
Returns the line type for given input.

#### Params
- **Element|SubElement** `source`: The source (sub)element.
- **Element|SubElement** `target`: The target (sub)element.
- **** `{}`: target

#### Return
- **String** The line type.

# `lib/composition/parsers/method.js`
### `parseMethod(input, defaultIns)`
Parses method inputs.

#### Params
- **String** `input`: The method input. Some common usages are:
  - `instance/method`
  - `!instance/method`
  - `>instance/method`
  - `:instance/method`
  - `method`
- **String** `defaultIns`: The instance name.

#### Return
- **Object** The parsed input.

# `lib/composition/node/subelm/index.js`
### `SubElmId(type, name, parent)`
Creates a new instance of `SubElmId`.

#### Params
- **Type|SubElement** `type`: The subelement type or the subelement itself.
- **String** `name`: The subelement name.
- **NodeId** `parent`: The subelement parent id.

#### Return
- **SubElmId** The `SubElmId` instance.

### `toString(noIndex)`
Stringifies a subelement id.

#### Params
- **Boolean** `noIndex`: If `true`, the index value will be ommited from the stringified id.

#### Return
- **String** The subelement id.

### `SubElm(type, data, parent)`
Creates a `SubElm` instance.

#### Params
- **Type** `type`: The subelement type.
- **Object** `data`: An object containing the following fields:
- **Element** `parent`: The element this subelement belongs to.

#### Return
- **SubElm** The `SubElm` instance.

### `Name(input)`
Gets the name from various inputs.

#### Params
- **Object** `input`: An object containing one of the following fields:
 - `name`
 - `event`
 - `serverMethod`
 - `method`

#### Return
- **String** The subelement name.

# `lib/composition/node/index.js`
### `NodeId(input, isServer)`
Creates a new `NodeId` instance.

#### Params
- **NodeElm** `input`: The node instance.
- **Boolean** `isServer`: If `true`, the node is on the server side, otherwise on the client.

#### Return
- **NodeId** The `NodeId` instance.

### `toString()`
Stringifies a node id.

#### Return
- **String** The stringified id.

### `NodeElm(data, isServer)`
Creates a new `NodeElm` instance.

#### Params
- **Object** `data`: The Engine instance data, plus the following fields:
 - `icon` (String): The node icon.
- **Boolean** `isServer`: If `true`, the node is on the server side, otherwise on the client.

#### Return
- **NodeElm** The `NodeElm` instance.

### `hasFlow()`
Checks if the node has flow or not.

#### Return
- **Boolean** `true` if the node has flow, `false` otherwise.

### `setColor(c)`
Sets or gets the element color.

#### Params
- **String** `c`: The new color.

#### Return
- **String** The set or current color.

### `position(x, y)`
Sets the element position.

#### Params
- **Number** `x`: The x coordinate.
- **Number** `y`: The y coordinate.

### `addSubElement(type, elm)`

#### Params
- **Type** `type`: The subelement type.
- **Object** `elm`: The subelement data.

#### Return
- **SubElement** The subelement instance.

### `getListeners(event)`
Gets the listners for a specific event.

#### Params
- **String** `event`: The event you want to get the listeners for.

#### Return
- **Array** An array of subelements (listeners).

### `getOrAddSubElm(type, _elm)`
Returns existing subelement or creates another one.

#### Params
- **Type** `type`: The subelement type.
- **Object** `_elm`: The subelement data.

#### Return
- **SubElement** The subelement instance.

# `lib/composition/line/index.js`
### `Line(input)`

#### Params
- **Object** `input`: An object containing the following fields:
 - `source` (Element|SubElement): The source element.
 - `target` (Element|SubElement): The target element.
 - `classes` (Array): An array with the line classes (they will be appended in the HTML).

#### Return
- **Line** The `Line` instance.

