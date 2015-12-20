"use strict";

// Dependencies
const NodeElm = require("./node")
    , SubElm = require("./node/subelm")
    , SubElmId = require("./node/subelm/id")
    , NodeId = require("./node/id")
    , LineElm = require("./line")
    , typpy = require("typpy")
    , deffy = require("deffy")
    , iterateObject = require("iterate-object")
    , ul = require("ul")
    , flatColors = require("flat-colors").colors
    , numberly = require("numberly")
    ;

class Graph {
    /**
     * Graph
     * Creates a new `Graph` instance.
     *
     * @name Graph
     * @function
     * @param {Object} input An object containing the following fields:
     *
     *   - `instances` (Object): The application instances.
     *   - `moduleInfo` (Object): Module related information.
     *   - `appService` (Object): Application service content (parsed).
     *
     * @return {Graph} The `Graph` instance.
     */
    constructor (input) {

        this.nodes = {};
        this.lines = {};

        // Internal caching
        this.ids = {};

        // Store composition data
        this.instances = deffy(input.instances, {});
        this.moduleInfo = deffy(input.moduleInfo, {});
        this.appService = deffy(input.appService, {});

        // Add the instances
        this.addInstances();
        this.addSubelms();
        this.addLines();
    }

    /**
     * addNode
     * Adds a new element.
     *
     * @name addNode
     * @function
     * @param {Element|Object} node The new element to add.
     * @return {Element} The added element.
     */
    addNode (node) {
        node = new NodeElm(node);
        return (this.nodes[node.id] = this.ids[node.id] = node);
    }

    /**
     * addLine
     * Adds a new line.
     *
     * @name addLine
     * @function
     * @param {Line|Object} line The line to add.
     * @return {Line} The added line.
     */
    addLine (line) {
        line = new LineElm(line);
        if (typpy(line.source, SubElm)) {
            line.source.lines[line.id] = line;
        }
        return (this.lines[line.id] = this.ids[line.id] = line);
    }

    /**
     * connect
     * Connects two elements.
     *
     * @name connect
     * @function
     * @param {Element} s The source element
     * @param {Element} t The target element
     * @param {Object} a Additional fields to be merged.
     */
    connect (s, t, a) {
        if (!s || !t) { return null; }
        return this.addLine(ul.merge(a, {
            source: s
          , target: t
        }));
    }

    /**
     * get
     * Prepares the data to be used in the builder or other client.
     *
     * @name get
     * @function
     * @return {Object} The get composition.
     */
    get () {
        var out = {
            nodes: {}
          , lines: {}
        };

        iterateObject(this.nodes, function (node, id) {

            var cNode = out.nodes[id] = {
                id: id
              , color: node.color || flatColors[numberly(id, 0, flatColors.length)][3]
              , domains: node.domains
              , icon: node.icon
              , name: node.label
              , name: node.name
              , subelms: {}
              , pos: node.pos
            };

            iterateObject(node.subelms, function (selm, sid) {
                var lns = {};
                var cSubElm = cNode.subelms[sid] = {
                    id: selm.id.toString()
                  , label: selm.label
                  , type: selm.type
                  , icon: selm.icon
                  , lines: lns
                };
                iterateObject(selm.lines, function (cLine, id) {
                    out.lines[id] = {
                        source: cLine.source.id.toString()
                      , target: cLine.target.id.toString()
                      , id: id
                      , classes: cLine.classes
                    };
                });
            });
        });
        return out;
    }

    /**
     * addInstance
     * Adds a new instance element.
     *
     * @name addInstance
     * @function
     * @param {Element} cInstance The current instance.
     * @param {Boolean} isServer A flag indicated where to add it: on the server or on the client.
     */
    addInstance (cInstance) {
        var info = null
          , cNode = null
          ;

        cNode = this.addNode(cInstance);
        info = Object(this.appService.e)[cNode.id];

        if (info) {
            if (info.color) {
                cNode.setColor(info.color);
            }
            if (info.pos) {
                cNode.position(info.pos);
            }
        }
    }

    /**
     * addInstances
     * Adds the composition instances.
     *
     * @name addInstances
     * @function
     * @param {Object} instances The application instances.
     */
    addInstances (instances) {
        iterateObject(
            deffy(instances, this.instances)
          , inst => this.addInstance(inst)
        );
    }

    addSubelms () {
        iterateObject(this.nodes, (node, id) => {
            // Add listeners
            iterateObject(node.pFlow, (listener, eventName) => {
                node.addSubElement(listener);
            });
        });
    }

    addLines () {
        let getListener = (eventObj, instanceNode) => {
            if (!eventObj) { return null; }
            if (typpy(eventObj, String)) {
                return instanceNode.subelms[new SubElmId("listener", eventObj, instanceNode)];
            }
            if (typpy(eventObj, "listener")) {
                return instanceNode.subelms[new SubElm(eventObj, instanceNode).id];
            }
            return getListener(eventObj.event, this.nodes[new NodeId({ name: eventObj.to })]);
        };
        iterateObject(this.nodes, (node, id) => {
            iterateObject(node.pFlow, (listener, eventName) => {
                var source = getListener(listener, node);
                this.connect(source, getListener(listener.error, node));
                this.connect(source, getListener(listener.end, node));
                listener.data.forEach(comp => {
                    if (typpy(comp, "emit")) {
                        this.connect(source, getListener(comp, node));
                    }
                });
            });
        });
    }
}

module.exports = Graph;
