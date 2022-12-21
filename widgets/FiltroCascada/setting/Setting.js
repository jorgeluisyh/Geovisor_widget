define(['dojo/_base/declare', 'jimu/BaseWidgetSetting', 'dijit/_WidgetsInTemplateMixin', 'esri/tasks/QueryTask', 'esri/tasks/query', 'dojo/_base/lang', 'jimu/LayerInfos/LayerInfos', 'dojo/_base/array', "dojo/dom", "dojo/on", "esri/request", 'dojox/layout/TableContainer', "dojo/html", "dijit/form/Select", "dijit/form/TextBox", "dijit/form/Button", "dijit/form/Textarea", "dojo/dom-construct", "dijit/registry"], function (declare, BaseWidgetSetting, _WidgetsInTemplateMixin, QueryTask, Query, lang, LayerInfos, array, dom, on, esriRequest, TableContainer, html, Select, TextBox, Button, Textarea, domConstruct, registry) {
    function _toConsumableArray(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
                arr2[i] = arr[i];
            }

            return arr2;
        } else {
            return Array.from(arr);
        }
    }

    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin, QueryTask, Query], {

        baseClass: 'filter-features-setting',
        onOpen: function onOpen() {
            console.log('FilterFeatures::onOpen');
        },

        startup: function startup() {
            this.inherited(arguments);
            //this.setConfig(this.config);

            // nueva funcion para cargar selecciones
            config = this.config;
            debugger;
            for (var i in config.features) {
                try {

                    this._createListElements(i, config.features[i].iddiv, config.features[i].url, this.idfeaturesSelected, config.features[i].title);
                } catch (e) {
                    console.log('no se actualizaron features');
                    console.log(e);
                }
            }

            max_id = 0;
            try {
                if (Object.keys(config.features).length > 0) {
                    max_id = Math.max.apply(Math, _toConsumableArray(Object.keys(config.features).map(function (o) {
                        return parseInt(o.split("_")[1]);
                    })));
                }
            } catch (e) {
                max_id = 0;
                console.log("No existen registros");
            }

            _contador = max_id;
            // _features = {};
            _divIdPref = 'divff_';
            _keyIdPref = 'keyff_';
            _layerInfosObjClone;
        },

        postCreate: function postCreate() {

            self = this;

            this._setListLayers(this.NodeUrlDepa, this.NodeFieldLabelDepa, this.NodeFieldValueDepa);
            this._setListLayers(this.NodeUrlProv, this.NodeFieldLabelProv, this.NodeFieldValueProv);
            this._setListLayers(this.NodeUrlDist, this.NodeFieldLabelDist, this.NodeFieldValueDist);

            // this._gridxLayers();
            this._populateSelect();

            if (this.config) {
                this.setConfig(this.config);
            }
        },


        setConfig: function setConfig(_config) {

            _features = _config.features;
            var config = _config;
            // this.NodeUrlDepa.set('options', config.departamento.options);
            this.NodeUrlDepa.set('value', config.departamento.id);
            this.NodeFieldLabelDepa.set('options', config.departamento.labelOptions);
            this.NodeFieldValueDepa.set('options', config.departamento.valueOptions);
            this.NodeFieldLabelDepa.set('value', config.departamento.label);
            this.NodeFieldValueDepa.set('value', config.departamento.value);

            // this.NodeUrlProv.set('options', config.provincia.options);
            this.NodeUrlProv.set('value', config.provincia.id);
            this.NodeFieldLabelProv.set('options', config.provincia.labelOptions);
            this.NodeFieldValueProv.set('options', config.provincia.valueOptions);
            this.NodeFieldLabelProv.set('value', config.provincia.label);
            this.NodeFieldValueProv.set('value', config.provincia.value);

            // this.NodeUrlDist.set('options', config.distrito.options);
            this.NodeUrlDist.set('value', config.distrito.id);
            this.NodeFieldLabelDist.set('options', config.distrito.labelOptions);
            this.NodeFieldValueDist.set('options', config.distrito.valueOptions);
            this.NodeFieldLabelDist.set('value', config.distrito.label);
            this.NodeFieldValueDist.set('value', config.distrito.value);

            // for (var i in config.features){
            //     try{
            //     this._createListElements(i, config.features[i].iddiv, config.features[i].url, this.idfeaturesSelected, config.features[i].title);
            //     }
            //     catch(e){
            //         console.log('no se actualizaron features');
            //         console.log(e);
            //     }
            // }
        },

        getConfig: function getConfig() {
            // var idSelect;
            // var idButton;
            // for (i = 0; i < _contador; i++) {
            //   idSelect = "selectFF_${i}";
            // }
            debugger;

            var config = {
                departamento: {
                    'id': this.NodeUrlDepa.value,
                    'label': this.NodeFieldLabelDepa.value,
                    'value': this.NodeFieldValueDepa.value,
                    'labelOptions': this.NodeFieldLabelDepa.options,
                    'valueOptions': this.NodeFieldValueDepa.options
                },
                provincia: {
                    'id': this.NodeUrlProv.value,
                    'label': this.NodeFieldLabelProv.value,
                    'value': this.NodeFieldValueProv.value,
                    'labelOptions': this.NodeFieldLabelProv.options,
                    'valueOptions': this.NodeFieldValueProv.options
                },
                distrito: {
                    'id': this.NodeUrlDist.value,
                    'label': this.NodeFieldLabelDist.value,
                    'value': this.NodeFieldValueDist.value,
                    'labelOptions': this.NodeFieldLabelDist.options,
                    'valueOptions': this.NodeFieldValueDist.options
                },
                features: _features
            };
            return config;
        },

        _setListLayers: function _setListLayers(dojonodeService, dojonodeAlias, dojonodeValue) {
            LayerInfos.getInstance(this.map, this.map.itemInfo).then(lang.hitch(this, function (layerInfosObj) {
                var infos = layerInfosObj.getLayerInfoArray();
                _layerInfosObjClone = layerInfosObj;
                var options = [];
                for (var i in infos) {
                    var arrayLayers = infos[i].getSubLayers();
                    if (arrayLayers.length > 0) {
                        var arrayoptions = this._listSubLayerdOfRootLayer(arrayLayers);
                        options.push.apply(options, arrayoptions.optSubLayers);
                        _layerInfosObjClone._layerInfos = _layerInfosObjClone._layerInfos.concat(arrayoptions.infoSubLayers);
                    } else {
                        options.push({
                            label: infos[i].title,
                            value: infos[i].id
                            // value: infos[i].layerObject.url,
                        });
                    }
                };
                dojonodeService.options = options;

                dojonodeService.on('change', function (evt) {
                    var selectedLayer = _layerInfosObjClone.getLayerInfoById(evt);

                    var url = selectedLayer.getUrl();
                    esriRequest({
                        url: url + "?f=json"
                        // url: evt + "?f=json"
                    }).then(function (response) {
                        var fields = response.fields;
                        var optionFields = [];
                        fields.forEach(function (field) {
                            optionFields.push({
                                label: field.alias,
                                value: field.name
                            });
                        });
                        dojonodeAlias.set('options', optionFields);
                        dojonodeValue.set('options', optionFields);
                    });
                });
            }));
        },
        _listSubLayerdOfRootLayer: function _listSubLayerdOfRootLayer(arrayLayers) {
            var optionsSublayers = [];
            var infosSublayers = [];
            recursiveSubLayers(arrayLayers);

            function recursiveSubLayers(arrayLayers) {
                for (var i in arrayLayers) {
                    var sublayers = arrayLayers[i].getSubLayers();
                    if (sublayers.length > 0) {
                        recursiveSubLayers(sublayers);
                    } else {
                        optionsSublayers.push({
                            label: arrayLayers[i].title,
                            value: arrayLayers[i].id
                            // value: arrayLayers[i].layerObject.url
                        });
                        infosSublayers.push(arrayLayers[i]);
                    }
                }
            };
            return {
                optSubLayers: optionsSublayers,
                infoSubLayers: infosSublayers
            };
        },
        _populateSelect: function _populateSelect() {
            this.NodeFeatures.options = self.NodeUrlDepa.options;
            // this.NodeFeatures.on('change', function(evt) {
            //     self._addRowLayerSelected(evt);
            // })
        },
        _addRowLayerSelected: function _addRowLayerSelected(evt) {
            debugger;
            var layer = _layerInfosObjClone.getLayerInfoById(evt);
            var url = layer.getUrl();
            _contador = _contador + 1;
            var iddiv = '' + _divIdPref + _contador;
            var keyf = '' + _keyIdPref + _contador;
            var controler = true;

            while (controler) {
                var reg = registry.byId(iddiv);
                if (reg) {
                    _contador = _contador + 1;
                    iddiv = '' + _divIdPref + _contador;
                    keyf = '' + _keyIdPref + _contador;
                } else {
                    controler = false;
                }
            }
            // var regregistry.byId(iddiv)

            // var r = {}
            // r[_contador] = {url: evt}
            debugger;
            _features[keyf] = { id: evt, iddiv: iddiv, url: url, field: "", title: layer.title };

            // for (var x =0 ; x<2; x++){
            //     this._createListElements(keyf+x, iddiv+x, url, "idfeaturesSelected", layer.title);
            // }
            this._createListElements(keyf, iddiv, url, "idfeaturesSelected", layer.title);

            // var container = dojo.create("div", {id: iddiv}, "idfeaturesSelected");
            // // }

            // _programmatic = new TableContainer({
            //     cols: 2,
            //     class: "containerItemsFeatures",
            //     customClass: "labelsAndValues",
            //     "labelWidth": "40%"
            // }, container);

            // esriRequest({
            //     url: url + "?f=json"
            // }).then(function(response) {
            //     var fields = response.fields;
            //     var optionFields = [{label: '------', value: '0'}]
            //     fields.forEach(function(field) {
            //         optionFields.push({
            //             label: field.alias,
            //             value: field.name,
            //         })
            //     })
            //     var sel = new Select({
            //         // id: `selectFF_${_contador}`,
            //         // name: "fieldSelect",
            //         options: optionFields,
            //         style:{width: "300px"},
            //         label: response.name,
            //     });

            //     sel.on("change", function(evt){
            //       _features[keyf]["field"] = evt;
            //     })

            //     var but = new Button({
            //         // id: `buttonFF_${_contador}`,
            //         // name: "removeButton",
            //         label: "remover",
            //         spanLabel: true,
            //         onClick:
            //           function(){
            //             delete _features[keyf]; 
            //             domConstruct.destroy(iddiv);
            //           }
            //     })

            //     _programmatic.addChild(sel);
            //     _programmatic.addChild(but);
            //     _programmatic.startup();
            // })


            // Create four text boxes

            // var sel = new Select({
            //   name: "fieldSelect",
            //   options: [{label:1, value:1}],
            //   label: "checar"
            // })

            // var text1 = new TextBox({
            //     label: "ProgText 1"
            // });
            // var text2 = new TextBox({
            //     label: "ProgText 2"
            // });
            // var text3 = new TextBox({
            //     label: "ProgText 3"
            // });
            // var text4 = new TextBox({
            //     label: "ProgText 4"
            // });

            // Add the four text boxes to the TableContainer
            // programmatic.addChild(sel);
            // programmatic.addChild(text2);
            // programmatic.addChild(text3);
            // programmatic.addChild(text4);

            // Start the table container. This initializes it and places
            // the child widgets in the correct place.
            // programmatic.startup();
        },


        _createListElements: function _createListElements(keyf, iddiv, url, contenedor, titulo) {
            debugger;
            dojo.destroy(iddiv);
            var container = dojo.create("div", { id: iddiv, style: { display: "block", "margin-top": "5px" } }, contenedor);
            // }

            // _programmatic = new TableContainer({
            //     cols: 2,
            //     class: "containerItemsFeatures",
            //     customClass: "labelsAndValues",
            //     showLabels: true,
            //     "labelWidth": "40%"
            // }, container);

            esriRequest({
                url: url + "?f=json"
            }).then(function (response) {
                var fields = response.fields;
                var optionFields = [{ label: '------', value: '0' }];
                fields.forEach(function (field) {
                    optionFields.push({
                        label: field.alias,
                        value: field.name
                    });
                });
                var sel = new Select({
                    // id: `selectFF_${_contador}`,
                    // name: "fieldSelect",
                    options: optionFields,
                    style: { width: "300px" },
                    label: titulo
                });

                if (!!_features[keyf]["field"]) {
                    sel.set('value', _features[keyf]["field"]);
                };

                sel.on("change", function (evt) {
                    _features[keyf]["field"] = evt;
                });

                var but = new Button({
                    // id: `buttonFF_${_contador}`,
                    // name: "removeButton",
                    label: "remover",
                    spanLabel: true,
                    onClick: function onClick() {
                        delete _features[keyf];
                        domConstruct.destroy(iddiv);
                    }
                });

                var label = new Textarea({
                    name: "myarea",
                    customClass: "noHover",
                    value: titulo,
                    readonly: true,
                    style: { width: "200px", border: 0, "pointer-events": "none", font: "12px 'Avenir Light', Verdana, Geneva, sans-serif" }
                }, "myarea");

                // _programmatic.addChild(sel);
                // _programmatic.addChild(but);
                containerhtml = document.getElementById(iddiv);

                label.placeAt(containerhtml);
                sel.placeAt(containerhtml);
                but.placeAt(containerhtml);
                // _programmatic.startup();
            });
        }

    });
});
//# sourceMappingURL=Setting.js.map
