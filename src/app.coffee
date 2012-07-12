Ext.Loader.setConfig({enabled:true});
Ext.Loader.setPath('Ext.ux', '../js/ux');
Ext.require('Ext.ux.layout.Center');

sampleData = [['Foo', '', '', ''], ['Bar', '', '', '']]

initMap = (map, layers, controls, zoomToExtent) ->
        map.addLayers(layers)
        map.addControls(controls)
        map.zoomToExtent(zoomToExtent)
        return map

initBasicRestrictedMap = (id, layers, controls, zoomToExtent) ->
        options = { restrictedExtent: zoomToExtent }
        map = new OpenLayers.Map(id, options)
        wms = new OpenLayers.Layer.WMS(
                "OpenLayers WMS",
                "http://vmap0.tiles.osgeo.org/wms/vmap0?",
                {layers: 'basic'})
        layers.push(wms)
        return initMap(map, layers, controls, zoomToExtent)

initEditorLayout = (store, layers, controls, zoomToExtent) ->
        layersPanel = {
                id: 'layers-panel',
                title: 'Layers',
                region: 'center',
                autoScroll: true,
                margins: '2 0 2 0',
                items: [{tbar: [{text: "New"}, {text: "Delete", disabled: true}], border: false},
                        {
                                xtype: 'gridpanel',
                                border: false,
                                store: store,
                                columns: [{
                                        id: 'name',
                                        text: 'Name',
                                        sortable: true,
                                        dataIndex: 'name'
                                },
                                {
                                        id: 'updated',
                                        text: 'Updated',
                                        sortable: true,
                                        dataIndex: 'updated'
                                },
                                {
                                        id: 'created',
                                        text: 'Created',
                                        sortable: true,
                                        dataIndex: 'created'
                                }]
                        }]

        }

        drawToolsPanel = {
                id: 'draw-tools-panel',
                title: 'Draw',
                region: 'north',
                border: false,
                layout: 'ux.center',
                widthRatio: 0.80,
                autoHeight: true,
                frame: true,
                items: [{
                        xtype: 'buttongroup',
                        columns: 3,
                        defaults: {scale: 'small'},
                        items: [{
                                xtype: 'button',
                                disabled: true,
                                text: 'Point',
                                enableToggle: true
                                },
                                {
                                xtype: 'button',
                                disabled: true,
                                text: 'Line',
                                enableToggle: true
                                },
                                {
                                xtype: 'button',
                                disabled: true,
                                text: 'Polygon',
                                enableToggle: true
                                }]
                        }]
                }

        modifyToolsPanel = {
                id: 'modify-tools-panel',
                title: 'Modify',
                region: 'north',
                border: false,
                layout: 'ux.center',
                widthRatio: 0.80,
                autoHeight: true,
                frame: true,
                items: [{
                        xtype: 'buttongroup',
                        columns: 4,
                        defaults: {scale: 'small'},
                        items: [{
                                xtype: 'button',
                                disabled: true,
                                text: 'Path',
                                enableToggle: true
                                },
                                {
                                xtype: 'button',
                                disabled: true,
                                text: 'Rotate',
                                enableToggle: true
                                },
                                {
                                xtype: 'button',
                                disabled: true,
                                text: 'Resize',
                                enableToggle: true
                                }
                                {
                                xtype: 'button',
                                disabled: true,
                                text: 'Move',
                                enableToggle: true
                                }]
                        }]
                }



        toolsPanel = {
                id: 'tools-panel',
                title: 'Toolbox',
                region: 'south',
                margins: '2 0 0 0',
                bodyStyle: 'padding: 4px',
                items: [drawToolsPanel, modifyToolsPanel]
                }

        mapPanel = {
                id: 'map-panel',
                region: 'center',
                layout: 'fit',
                margins: '5 5 5 0',
                activeItem: 0,
                border: false,
                items: []
                }

        Ext.create('Ext.Viewport', {
                layout: 'border',
                title: 'Ext Layout Browser',
                items: [{
                        xtype: 'box',
                        id: 'header',
                        region: 'north',
                        html: '<h1>localpoints on a map</h1>',
                        height: 30
                        },
                        {
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
                        },
                        mapPanel],
                renderTo: Ext.getBody()
        })
        initBasicRestrictedMap('map-panel-body', layers, controls, zoomToExtent)

initEditor = (store) ->
        OpenLayers.Feature.Vector.style['default']['strokeWidth'] = '2'

        renderer = OpenLayers.Util.getParameters(window.location.href).renderer
        vectors = new OpenLayers.Layer.Vector("Vector Layer", {
                renderers: if renderer then [renderer] else OpenLayers.Layer.Vector.prototype.renderers
        });

        lineTool = new OpenLayers.Control.DrawFeature(vectors,
                OpenLayers.Handler.Path)

        featureModifier = new OpenLayers.Control.ModifyFeature(vectors)
        featureModifier.mode = OpenLayers.Control.ModifyFeature.RESHAPE \
                | OpenLayers.Control.ModifyFeature.DRAG \
                | OpenLayers.Control.ModifyFeature.RESIZE \
                | OpenLayers.Control.ModifyFeature.ROTATE

        extent = new OpenLayers.Bounds(8, 44.5, 19, 50)

        initEditorLayout(store, [vectors], [lineTool, featureModifier], extent)

Ext.onReady(() ->
        sampleStore = Ext.create('Ext.data.ArrayStore', {
                fields: [
                        {name: 'name'},
                        {name: 'features'}
                        {name: 'created', type: 'date'}
                        {name: 'updated', type: 'date'}
                        ],
                data: sampleData
                })
        initEditor(sampleStore)
)
