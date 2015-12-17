"use strict";

// Dependencies
var NodeElm = require("./node")
  , SubElm = require("./node/subelm")
  , LineElm = require("./line")
  , Typpy = require("typpy")
  , Deffy = require("deffy")
  , IterateObject = require("iterate-object")
  , Ul = require("ul")
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
        this.instances = Deffy(input.instances, {});
        this.moduleInfo = Deffy(input.moduleInfo, {});
        this.appService = Deffy(input.appService, {});

        // Add the instances
        this.addInstances();
    }

    /**
     * get
     * Gets a provided element/element id.
     *
     * @name get
     * @function
     * @param {String|Element} elm The element id or the element itself.
     * @return {Element} The found element internally.
     */
    get (elm) {
        if (Typpy(elm, String)) {
            return this.ids[elm];
        }
        if (Typpy(elm, Object)) {
            return this.get(new NodeElm.Id(elm).toString());
        }
        return null;
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
        debugger
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
        if (Typpy(line.source, SubElm)) {
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
        var self = this
          , result = []
          , r
          , sourceIsArray = false
          ;

        if ((sourceIsArray = Typpy(s, Array)) || Typpy(t, Array)) {
            r = (sourceIsArray ? s : t).map(sourceIsArray ? function (c) {
                return self.connect(c, t, a);
            } : function (c) {
                return self.connect(s, c, a);
            });
            IterateObject(r, function (c) {
                if (Typpy(c, Array)) {
                    return IterateObject(c, function (c) {
                        result.push(c);
                    });
                }
                result.push(c);
            });
            return result;
        }

        return this.addLine(Ul.merge(a, {
            source: s
          , target: t
        }));
    }

    /**
     * prepare
     * Prepares the data to be used in the builder or other client.
     *
     * @name prepare
     * @function
     * @return {Object} The prepared composition.
     */
    prepare () {
        var out = {
            nodes: {}
          , lines: {}
        };

        IterateObject(this.nodes, function (node, id) {
            var cNode = out.nodes[id] = {
                id: node.id.toString()
              , isServer: node.id.isServer
              , color: node.color
              , domains: node.domains
              , icon: node.icon
              , name: node.label
              , _name: node.name
              , subelms: {}
              , pos: node.pos
              , flow: node.flow
              , pFlow: node.pFlow
            };

            IterateObject(node.subelms, function (selm, sid) {
                var lns = {};
                var cSubElm = cNode.subelms[sid] = {
                    id: selm.id.toString()
                  , label: selm.label
                  , type: selm.type
                  , icon: selm.icon
                  , lines: lns
                };
                if (selm.flowLines) {
                    cSubElm.flowLines = selm.flowLines.map(function (c) {
                        return c.map(function (c) {
                            return c.id.toString();
                        });
                    });
                }
                IterateObject(selm.lines, function (cLine, id) {
                    lns[id] = {
                        source: cLine.source.id.toString()
                      , target: cLine.target.id.toString()
                      , id: id
                      , classes: cLine.source
                    };
                });
            });
        });

        IterateObject(this.lines, function (line, id) {
            out.lines[id] = {
                source: line.source.id.toString()
              , target: line.target.id.toString()
              , id: line.id.toString()
              , classes: line.classes
            };
        });

        return out;
    }

    /**
     * addModuleFlow
     * Adds the listener elements.
     *
     * @name addModuleFlow
     * @function
     * @param {Element} inst The current instance.
     * @return {Element} The current instance.
     */
    addModuleFlow (inst) {
        var mod = null;

        inst = Ul.deepMerge(inst, {
            client: {
                flow: []
            }
          , flow: []
        });


        var composition = null;

        if (Typpy(inst.module, Object)) {
            composition = Ul.deepMerge(inst.module, {
                client: {
                    flow: []
                }
              , flow: []
            });
        } else {
            if (!Typpy(mod = this.moduleInfo[inst.module], Object)) {
                return inst;
            }
            composition = mod.package.composition;
        }

        inst.flow = composition.flow.concat(inst.flow);
        inst.client.flow = composition.client.flow.concat(inst.client.flow);
        return inst;
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
        IterateObject(
            Deffy(instances, this.instances)
          , inst => this.addInstance(inst)
        );
    }

    /**
     * parseFlow
     * Parses the flow.
     *
     * @name parseFlow
     * @function
     */
    parseFlow () {
        var self = this;

        // Add the listeners bubbles (multiple ones)
        IterateObject(self.nodes, function (node) {
            IterateObject(node.pFlow, function (flow, event) {
                for (var i = 0; i < flow.length; ++i) {
                    node.getOrAddSubElm(Enny.TYPES.listener.name, {
                        event: event
                      , index: i
                    });
                }
            });
        });
    }

    /**
     * addConnections
     * Adds the connections.
     *
     * @name addConnections
     * @function
     */
    addConnections () {

        var self = this;

        // Iterate nodes
        IterateObject(self.nodes, function (node) {

            // Instance load
            IterateObject(node.load, function (target) {

                var tNode = self.get({
                    name: target
                  , isServer: node.id.isServer
                });

                self.connect(node, tNode);
            });

            // Add listeners
            IterateObject(node.pFlow, function (flow, event) {

                // Each flow element
                IterateObject(flow, function (elm, lIndex) {

                    var listenerBubble = node.getOrAddSubElm(Enny.TYPES.listener.name, {
                        event: event
                      , index: lIndex
                    });

                    listenerBubble.flowLines = [];

                    function cacheFlowLine(input) {
                        if (Typpy(input, Array)) {
                            if (input.length === 0) { return; }
                            return listenerBubble.flowLines.push(input);
                        }
                        cacheFlowLine([input]);
                    }

                    //var targetNode = node;
                    var handlers = {
                        error: []
                      , data: []
                    };

                    var streams = [];

                    var lastStreamElm = listenerBubble;
                    var firstListener = listenerBubble;
                    var lastConnectedElm = firstListener;

                    streams.push(lastStreamElm);

                    // Each flow component
                    IterateObject(elm, function (comp, compIndex, comps) {
                        var targetNode = null
                          , lastLine = null
                          ;

                        // Event load
                        if (Enny.TYPES(comp.type, Enny.TYPES.load)) {
                            IterateObject(comp.args[0], function (cLoad) {
                                targetNode = self.get({
                                    name: cLoad
                                  , isServer: node.id.isServer
                                });
                                cacheFlowLine(self.connect(listenerBubble, targetNode));
                            });
                            return;
                        }

                        targetNode = self.get({
                            name: comp.instance
                          , isServer: !!comp.serverMethod || node.id.isServer
                        });

                        var targetType = Parsers.ConvertToOn(comp);

                        var targetSubElm = targetNode.getOrAddSubElm(
                            targetType
                          , comp
                        );

                        var targetIsListener = Enny.TYPES(targetType, Enny.TYPES.listener);
                        if (targetIsListener) {
                            targetSubElm = targetNode.getListeners(comp.event);
                            if (!targetSubElm.length) {
                                console.warn("No listener.", comp);
                                return;
                            }
                        }

                        if (!targetSubElm) {
                            console.warn("Cannot found the target element", comp);
                            return;
                        }

                        var fElm = lastStreamElm;

                        function handleDataHandlers(c, i, a) {

                            var tmpTargetNode = self.get({
                                name: c.instance
                              , isServer: node.id.isServer
                            });

                            var cTarget = tmpTargetNode.getOrAddSubElm(
                                Parsers.ConvertToOn(c)
                              , c
                            );

                            cacheFlowLine(self.connect(fElm, cTarget));
                            fElm = lastConnectedElm = cTarget;

                            if (i === a.length - 1 && targetSubElm !== lastConnectedElm) {
                               cacheFlowLine(self.connect(lastConnectedElm, targetSubElm));
                            }
                        }

                        function createDataAndErrorHandlers() {
                            fElm = lastStreamElm;
                            IterateObject(handlers.data, handleDataHandlers);

                            fElm = lastStreamElm;
                            IterateObject(handlers.error, handleDataHandlers);

                            fElm = lastConnectedElm = targetSubElm;
                            fElm = lastStreamElm = targetSubElm;
                        }

                        function addInputStreams() {
                            var s = streams.slice(-2)
                              , st = s[0]
                              , ss = s[1]
                              ;

                            if (st && ss && !ss.disableInput) {
                                cacheFlowLine(self.connect(ss, st, {
                                    classes: ["input"]
                                }));
                            }
                        }

                        if (comp.type === Enny.TYPES.link || comp.type === Enny.TYPES.streamHandler || comp.type === Enny.TYPES.emit) {
                            streams.push(targetSubElm);
                        }

                        switch (comp.type) {
                            case Enny.TYPES.streamHandler:
                            case Enny.TYPES.emit:
                            case Enny.TYPES.link:
                                if (handlers.data.length || handlers.error.length) {
                                    createDataAndErrorHandlers();
                                } else {
                                    cacheFlowLine(self.connect(lastStreamElm, targetSubElm));
                                }
                                addInputStreams();
                                return;
                            case Enny.TYPES.dataHandler:
                            case Enny.TYPES.errorHandler:
                                handlers[["error", "data"][Number(Enny.TYPES(comp.type, Enny.TYPES.dataHandler))]].push(comp);
                                break;
                        }

                        if (compIndex === comps.length - 1) {
                            createDataAndErrorHandlers();
                            addInputStreams();
                        }
                    });
                });
            });
        });
    }
}

module.exports = Graph;
