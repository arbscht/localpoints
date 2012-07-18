// Generated by CoffeeScript 1.3.3
(function() {
  var FROM_PROJ, OSM_PROJ, deleteLayer, disableToolbox, enableToolbox, handleLayerRowSelectRequest, handleNewLayerRequest, initBasicRestrictedEditableMap, initEditableMap, initEditor, initEditorLayout, sampleData, useLineTool, useMoveTool, useNoTool, usePathTool, usePointTool, usePolygonTool, useResizeTool, useRotateTool, useTool;

  Ext.Loader.setConfig({
    enabled: true
  });

  Ext.Loader.setPath('Ext.ux', './js/ux');

  Ext.require('Ext.ux.layout.Center');

  Ext.define('Layer', {
    extend: 'Ext.data.Model',
    idgen: 'uuid',
    fields: [
      {
        name: 'name',
        type: 'string'
      }, {
        name: 'features',
        type: 'string'
      }, {
        name: 'created',
        type: 'date'
      }, {
        name: 'updated',
        type: 'date'
      }
    ],
    proxy: {
      type: 'localstorage',
      id: 'localpoints-layers'
    }
  });

  FROM_PROJ = new OpenLayers.Projection('EPSG:4326');

  OSM_PROJ = new OpenLayers.Projection('EPSG:900913');

  sampleData = [
    {
      name: 'Foo',
      features: '',
      created: '',
      updated: ''
    }, {
      name: 'Bar',
      features: '',
      created: '',
      updated: ''
    }
  ];

  Ext.define('CurrentLayer', {
    singleton: true,
    record: null
  });

  useTool = function(selectedControlName, controls) {
    var control, name, _results;
    _results = [];
    for (name in controls) {
      control = controls[name];
      if (name === selectedControlName) {
        _results.push(control.activate());
      } else {
        _results.push(control.deactivate());
      }
    }
    return _results;
  };

  usePointTool = function(controls) {
    return useTool('point', controls);
  };

  useLineTool = function(controls) {
    return useTool('line', controls);
  };

  usePolygonTool = function(controls) {
    return useTool('polygon', controls);
  };

  usePathTool = function(controls) {
    controls.modify.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
    return useTool('modify', controls);
  };

  useRotateTool = function(controls) {
    controls.modify.mode = OpenLayers.Control.ModifyFeature.RESHAPE | OpenLayers.Control.ModifyFeature.ROTATE;
    return useTool('modify', controls);
  };

  useResizeTool = function(controls) {
    controls.modify.mode = OpenLayers.Control.ModifyFeature.RESHAPE | OpenLayers.Control.ModifyFeature.RESIZE;
    return useTool('modify', controls);
  };

  useMoveTool = function(controls) {
    controls.modify.mode = OpenLayers.Control.ModifyFeature.RESHAPE | OpenLayers.Control.ModifyFeature.DRAG;
    return useTool('modify', controls);
  };

  useNoTool = function(controls) {
    var control, name, _results;
    _results = [];
    for (name in controls) {
      control = controls[name];
      _results.push(control.deactivate());
    }
    return _results;
  };

  disableToolbox = function() {
    var button, buttons, _i, _len, _results;
    buttons = Ext.getCmp('tools-panel').query('button');
    _results = [];
    for (_i = 0, _len = buttons.length; _i < _len; _i++) {
      button = buttons[_i];
      button.blur();
      _results.push(button.disable());
    }
    return _results;
  };

  enableToolbox = function() {
    var button, buttons, _i, _len, _results;
    buttons = Ext.getCmp('tools-panel').query('button');
    _results = [];
    for (_i = 0, _len = buttons.length; _i < _len; _i++) {
      button = buttons[_i];
      _results.push(button.enable());
    }
    return _results;
  };

  deleteLayer = function(store) {
    if (CurrentLayer.record !== null) {
      store.remove([CurrentLayer.record]);
      CurrentLayer.record = null;
      disableToolbox();
      useNoTool();
      store.sync();
      if (store.count() === 0) {
        return Ext.getCmp('layerDeleteButton').blur().disable();
      }
    }
  };

  handleNewLayerRequest = function(button, event, store) {
    return store.add({
      name: 'Untitled',
      features: '',
      created: new Date(),
      updated: null
    });
  };

  handleLayerRowSelectRequest = function(selection, record, opts, store) {
    CurrentLayer.record = record[0];
    enableToolbox();
    if (Ext.getCmp('layerDeleteButton').isDisabled()) {
      return Ext.getCmp('layerDeleteButton').enable();
    }
  };

  initEditableMap = function(map, baseLayer, vectorLayer, tools, zoomToExtent) {
    var control, name;
    map.addLayer(baseLayer);
    map.setBaseLayer(baseLayer);
    map.addLayer(vectorLayer);
    for (name in tools) {
      control = tools[name];
      map.addControl(control);
    }
    map.zoomToExtent(zoomToExtent);
    return map;
  };

  initBasicRestrictedEditableMap = function(id, vectorLayer, tools, zoomToExtent) {
    var map, options, osm;
    options = {
      restrictedExtent: zoomToExtent
    };
    map = new OpenLayers.Map(id, options);
    osm = new OpenLayers.Layer.OSM();
    return initEditableMap(map, osm, vectorLayer, tools, zoomToExtent);
  };

  initEditorLayout = function(store, vectorLayer, tools, zoomToExtent) {
    var drawToolsPanel, layersPanel, mapPanel, modifyToolsPanel, toolsPanel;
    layersPanel = {
      id: 'layers-panel',
      title: 'Layers',
      region: 'center',
      autoScroll: true,
      margins: '2 0 2 0',
      items: [
        {
          tbar: [
            {
              text: "New",
              handler: function(b, e) {
                return handleNewLayerRequest(b, e, store);
              }
            }, {
              text: "Delete",
              id: "layerDeleteButton",
              focusOnToFront: false,
              enableToggle: false,
              disabled: true,
              listeners: {
                click: function() {
                  return deleteLayer(store);
                }
              }
            }
          ],
          border: false
        }, {
          xtype: 'gridpanel',
          border: false,
          selType: 'rowmodel',
          plugins: [
            Ext.create('Ext.grid.plugin.CellEditing', {
              clicksToEdit: 2
            })
          ],
          store: store,
          listeners: {
            selectionchange: function(m, r, o) {
              return handleLayerRowSelectRequest(m, r, o, store);
            }
          },
          columns: [
            {
              id: 'name',
              text: 'Name',
              sortable: true,
              dataIndex: 'name',
              field: {
                xtype: 'textfield',
                allowBlank: false
              }
            }, {
              id: 'updated',
              text: 'Updated',
              sortable: true,
              dataIndex: 'updated'
            }, {
              id: 'created',
              text: 'Created',
              sortable: true,
              dataIndex: 'created'
            }
          ]
        }
      ]
    };
    drawToolsPanel = {
      id: 'draw-tools-panel',
      title: 'Draw',
      region: 'north',
      border: false,
      layout: 'ux.center',
      widthRatio: 0.80,
      autoHeight: true,
      frame: true,
      items: [
        {
          xtype: 'buttongroup',
          columns: 3,
          defaults: {
            scale: 'small'
          },
          items: [
            {
              xtype: 'button',
              disabled: true,
              text: 'Point',
              enableToggle: true,
              toggleGroup: 'toolbox',
              toggleHandler: function(button, state) {
                if (state) {
                  return usePointTool(tools);
                }
              }
            }, {
              xtype: 'button',
              disabled: true,
              text: 'Line',
              enableToggle: true,
              toggleGroup: 'toolbox',
              toggleHandler: function(button, state) {
                if (state) {
                  return useLineTool(tools);
                }
              }
            }, {
              xtype: 'button',
              disabled: true,
              text: 'Polygon',
              enableToggle: true,
              toggleGroup: 'toolbox',
              toggleHandler: function(button, state) {
                if (state) {
                  return usePolygonTool(tools);
                }
              }
            }
          ]
        }
      ]
    };
    modifyToolsPanel = {
      id: 'modify-tools-panel',
      title: 'Modify',
      region: 'north',
      border: false,
      layout: 'ux.center',
      widthRatio: 0.80,
      autoHeight: true,
      frame: true,
      items: [
        {
          xtype: 'buttongroup',
          columns: 4,
          defaults: {
            scale: 'small'
          },
          items: [
            {
              xtype: 'button',
              disabled: true,
              text: 'Path',
              enableToggle: true,
              toggleGroup: 'toolbox',
              toggleHandler: function(button, state) {
                if (state) {
                  return usePathTool(tools);
                }
              }
            }, {
              xtype: 'button',
              disabled: true,
              text: 'Rotate',
              enableToggle: true,
              toggleGroup: 'toolbox',
              toggleHandler: function(button, state) {
                if (state) {
                  return useRotateTool(tools);
                }
              }
            }, {
              xtype: 'button',
              disabled: true,
              text: 'Resize',
              enableToggle: true,
              toggleGroup: 'toolbox',
              toggleHandler: function(button, state) {
                if (state) {
                  return useResizeTool(tools);
                }
              }
            }, {
              xtype: 'button',
              disabled: true,
              text: 'Move',
              enableToggle: true,
              toggleGroup: 'toolbox',
              toggleHandler: function(button, state) {
                if (state) {
                  return useMoveTool(tools);
                }
              }
            }
          ]
        }
      ]
    };
    toolsPanel = {
      id: 'tools-panel',
      title: 'Toolbox',
      region: 'south',
      margins: '2 0 0 0',
      bodyStyle: 'padding: 4px',
      items: [drawToolsPanel, modifyToolsPanel]
    };
    mapPanel = {
      id: 'map-panel',
      region: 'center',
      layout: 'fit',
      margins: '5 5 5 0',
      activeItem: 0,
      border: false,
      items: []
    };
    Ext.create('Ext.Viewport', {
      layout: 'border',
      title: 'Ext Layout Browser',
      items: [
        {
          xtype: 'box',
          id: 'header',
          region: 'north',
          html: '<h1>localpoints on a map</h1>',
          height: 30
        }, {
          layout: 'border',
          id: 'layout-browser',
          region: 'west',
          border: false,
          split: true,
          margins: '5 0 5 5',
          width: 300,
          minSize: 160,
          maxSize: 400,
          items: [layersPanel, toolsPanel]
        }, mapPanel
      ],
      renderTo: Ext.getBody()
    });
    return initBasicRestrictedEditableMap('map-panel-body', vectorLayer, tools, zoomToExtent);
  };

  initEditor = function(store) {
    var extent, featureModifier, renderer, tools, vectors;
    OpenLayers.Feature.Vector.style['default']['strokeWidth'] = '2';
    renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
    vectors = new OpenLayers.Layer.Vector("Vector Layer", {
      renderers: renderer ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers
    });
    featureModifier = new OpenLayers.Control.ModifyFeature(vectors);
    tools = {
      point: new OpenLayers.Control.DrawFeature(vectors, OpenLayers.Handler.Point),
      line: new OpenLayers.Control.DrawFeature(vectors, OpenLayers.Handler.Path),
      polygon: new OpenLayers.Control.DrawFeature(vectors, OpenLayers.Handler.Polygon),
      modify: featureModifier
    };
    extent = new OpenLayers.Bounds(174.6, -37, 175, -36.8).transform(FROM_PROJ, OSM_PROJ);
    return initEditorLayout(store, vectors, tools, extent);
  };

  Ext.onReady(function() {
    var sampleStore;
    sampleStore = Ext.create('Ext.data.Store', {
      model: 'Layer',
      data: sampleData
    });
    return initEditor(sampleStore);
  });

}).call(this);
