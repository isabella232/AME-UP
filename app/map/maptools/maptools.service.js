'use strict';

angular.module('MapToolsService', ['APIService', 'SettingsService'])
	.factory('MapTools', function($rootScope, $mdToast, $mdDialog, MapSettings, LayersTabSettings) {
		console.log("MapTools init enter");
		
		let data = {
			iMode: false,
			polyMode: false,
			bboxMode: false
		}

		let showToast = function(message) {
			$mdToast.show(
				$mdToast.simple()
					.textContent(message)
					.hideDelay(3000)
			);
		};

		let features = new ol.Collection();
		let featureOverlay = new ol.layer.Vector({
			source: new ol.source.Vector({features: features}),
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(255, 255, 255, 0.2)'
				}),
				stroke: new ol.style.Stroke({
					color: '#ffcc33',
					width: 2
				}),
				image: new ol.style.Circle({
					radius: 7,
					fill: new ol.style.Fill({
						color: '#ffcc33'
					})
				})
			})
		});
		
		let iClicked = function() {
			console.log("info clicked");
			data.iMode = !data.iMode;
			if (data.iMode) {
				//showToast("Info mode not yet implemented");
				data.polyMode = false;
				data.bboxMode = false;
				clearPolyInteraction();
				clearBboxInteraction();
				addInfoInteraction();
			}
		}
		
		let addInfoInteraction = function() {
			/***
			let selectSingleClick = new ol.interaction.Select();
			selectSingleClick.on('select', event => {
				console.log("single click received");
				console.log(event);
				let selectPoint = event.mapBrowserEvent.coordinate;
				console.log("selectPoint = "); console.log(selectPoint);
				if (data.iMode) {
					LayersTabSettings.data.queryResults = [];
					let layer = MapSettings.data.layers.find(l => {return l.name === LayersTabSettings.data.queryLayer;});
					if (layer != null) {
						console.log(layer);
						queryFeatures(layer,selectPoint); 
					}
				}
			});
			MapSettings.data.theMap.addInteraction(selectSingleClick);
			***/
			featureOverlay.setMap(MapSettings.data.theMap);

			MapSettings.data.theMap.on('singleclick', function(event) {
				console.log("single click received");
				console.log(event);
				let selectPoint = event.coordinate;
				console.log("selectPoint = "); console.log(selectPoint);
				if (data.iMode) {
					LayersTabSettings.data.queryResults = [];
					let layer = MapSettings.data.layers.find(l => {return l.name === LayersTabSettings.data.queryLayer;});
					if (layer != null) {
						console.log(layer);
						console.log("original event = "); console.log(event.originalEvent);
						queryFeatures(layer,selectPoint, event.originalEvent); 
					}
				}				
			});
		}
		
		let layerClicked = function(layerName) {
			console.log("layer clicked = " + layerName);
			//LayersTabSettings.data.queryLayer = layerName;
			//only make selected layer if it is visible
			MapSettings.data.layers.some(function(layer) {
				if (layer.name === layerName) {
					if (layer.visible) {
						LayersTabSettings.data.queryLayer = layerName;
					}
				}
			});
		}		
		
		//TODO: Would prefer to not pass event. Would prefer to not open dialog from in this routine. Maybe return a promise and let caller do it.
		let queryFeatures = ((layer, thePoint, event) => {
			
			//TODO: move all this into layers table and pull from each layer
			let bogiFeatureParams = {
				featureNamespace:	'section368',
				featurePrefix:		'section368',
				outputFormat:		'application/json',
				geometryName:		'geom',
				queryURL:			'https://bogi.evs.anl.gov/map/section368/ows'
			}
			
			let ameupFeatureParams = {
				featureNamespace:	'http://ameup.usgin.org',
				featurePrefix:		'AMEUP',
				outputFormat:		'application/json',
				geometryName:		'the_geom',
				queryURL:			'http://ameup.usgin.org:8080/geoserver/wfs'
			}
			
			//The azgs layers are a bit boogered for now so I'm going to ignore them
			let azgsFeatureParams = {
				featureNamespace:	undefined,
				featurePrefix:		undefined,
				outputFormat:		undefined,
				geometryName:		undefined,
				queryURL:			undefined
			}
			
			console.log(layer);
			console.log(layer.source.url);
			console.log(layer.source.params);			
			
			let paramStub;
			if (layer.source.url.toLowerCase().includes("bogi")) {
				paramStub = bogiFeatureParams;
			} else if (layer.source.url.toLowerCase().includes("ameup")) {
				paramStub = ameupFeatureParams;
			} else if (layer.source.url.toLowerCase().includes("azgs")) {
				paramStub = azgsFeatureParams;
			} else {
				paramStub = {};
			}
			
			let featureType = layer.source.params.LAYERS;
			if (featureType != undefined) {
				let split = featureType.split(":");
				featureType = split.length == 1 ? featureType : split[1];
			}
			console.log("featureType = " + featureType);

			let featureRequest = new ol.format.WFS().writeGetFeature({
				srsName: 'EPSG:3857',
				featureNS: paramStub.featureNamespace,
				featurePrefix: paramStub.featurePrefix,
				featureTypes: [featureType], 
				outputFormat: 'application/json',
				//Need to add the following filter, but it doesn't exist in the version of OpenLayers (3.16.0) loaded by the bower install of angular-openlayers-directive.
				//filter: ol.format.ogc.filter.intersects(paramStub.geometryName, new ol.geom.Point(thePoint), 'urn:ogc:def:crs:EPSG::3857')
			});
				
			console.log(featureRequest);
						
			//make sure its good to go
			featureRequest = featureRequest.hasChildNodes() ? featureRequest : undefined;
			
			if (featureRequest != undefined && paramStub.queryURL != undefined) {
				//TODO: This is a terrible hack. I need to use ol.format.ogc.filter.intersects filter, but it doesn't exist in the version of OpenLayers (3.16.0) loaded by the bower install of angular-openlayers-directive. I could copy the version of openlayers I want (3.18) over the other one in bower_components, but that would break on any new bower install. So, instead, I'm hacking in the needed XML. It's ugly and I hate it but it does what I need. 
				let queryString = new XMLSerializer().serializeToString(featureRequest);
				console.log(queryString);
				let filterString = '><Filter xmlns="http://www.opengis.net/ogc"><Intersects><PropertyName>' + paramStub.geometryName + '</PropertyName><Point xmlns="http://www.opengis.net/gml" srsName="urn:ogc:def:crs:EPSG::3857"><pos>' + thePoint[0] + ' ' + thePoint[1] + '</pos></Point></Intersects></Filter></Query>';
				console.log(filterString);
				queryString = queryString.replace("/>", filterString)
				console.log(queryString);
				
				// then post the request and add the received features to a layer
				fetch('/proxy/' + paramStub.queryURL, {
					method: 'POST',
					//body: new XMLSerializer().serializeToString(featureRequest) //TODO: this is the one I'd use if I didn't have to hack it as above
					body: queryString
				}).then(function(response) {
					console.log(response);
					return response.json();
					//return response.text();
				}).then(function(json) {
					console.log(json);
		
					features.clear();
					let feature;
					try {
						feature = new ol.format.GeoJSON().readFeatures(json)[0];
					} catch(err) {
					}
					if (feature !== undefined) {
						features.push(feature);
						showInfoDialog(layer.name, json.features[0].properties, event);
					} else {
						const noData = {noData: "There is no feature in that location"};
						showInfoDialog(layer.name, noData, event);
					}
					
				});
			} else {
				console.log("Layer cannot be queried");
				let notQueryable = {noData:"Layer cannot be queried"};
				showInfoDialog(layer.name, notQueryable, event);
			}

		});
	
		let showInfoDialog = function(title, json, event) {
			console.log("show results");
			console.log("object keys"); console.log(Object.keys(json));
			alert = $mdDialog.alert({
				title: title,
				locals: { title: title, json: json, keys: Object.keys(json), values: Object.values(json)  },
				controller: DialogController,
				templateUrl: 'map/maptools/results_dialog.html',
				targetEvent: event,
				ok: 'Done'
			});
			
			function DialogController($scope, $mdDialog, title, json, keys, values) {
				$scope.showJson = false;
				$scope.title = title;
				$scope.json = json;
				$scope.keys = keys;
				$scope.values = values;
				$scope.closeDialog = function() {
					$mdDialog.hide();
				}
			}

			$mdDialog
				.show( alert )
				.finally(function() {
					alert = undefined;
				});
		}

		
		let bboxClicked = function() {
			data.bboxMode = !data.bboxMode;
			if (data.bboxMode) {
				data.polyMode = false;
				data.iMode = false;		
				clearPolyInteraction();
				addBboxInteraction();
			} else {
				MapSettings.data.theMap.removeInteraction(dragBox);		
			}
		}
	
		let dragBox = new ol.interaction.DragBox({
			//condition: ol.events.condition.shiftKeyOnly,
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: [0, 0, 255, 1]
				})
			})
		});
		let layer;

		let addBboxInteraction = function() {
			console.log("add bbox interaction");
			if (MapSettings.data.theMap === undefined) {
				return;
			}

			if (MapSettings.data.aoi != undefined) {
				features.push(new ol.Feature(MapSettings.data.aoi));
			}
			featureOverlay.setMap(MapSettings.data.theMap);
			
			dragBox.on('boxend', (evt) => {
				console.log("boxend");
				document.getElementById('positionDisplay').style.visibility = "hidden";
				MapSettings.data.aoi = dragBox.getGeometry();			
				
				features.push(new ol.Feature(MapSettings.data.aoi));
				featureOverlay.setMap(MapSettings.data.theMap);	
			});

			// To remove the layer when start drawing a new dragbox
			dragBox.on('boxstart', (evt) => {
				features.clear();
				featureOverlay.setMap(null);
				MapSettings.data.aoi = undefined;
			});		

			dragBox.on('boxdrag', (evt) => {
				document.getElementById('positionDisplay').style.visibility = "visible";
			});		
			
			MapSettings.data.theMap.addInteraction(dragBox);
		}
		
		let clearBboxInteraction = function() {
			console.log("clearBboxInteraction");
			data.bboxMode = false;
			if (MapSettings.data.theMap === undefined) {
				console.log("clearBboxInteraction, no map");
				return;
			}
			features.clear();
			featureOverlay.setMap(null);
			MapSettings.data.theMap.removeInteraction(dragBox);		
		}

		let polyClicked = function() {
			data.polyMode = !data.polyMode;
			if (data.polyMode) {
				data.bboxMode = false;
				data.iMode = false;		
				clearBboxInteraction();
				addPolyInteraction();		
			} else {
				MapSettings.data.theMap.removeInteraction(draw);		
				MapSettings.data.theMap.removeInteraction(modify);		
			}
		}
		
		let modify = new ol.interaction.Modify({
			features: features,
		});
		
		modify.on('changed', function(evt) {
			console.log("changed");
			MapSettings.data.aoi = evt.feature.getGeometry();
		});
		
			
		let draw = new ol.interaction.Draw({
			features: features,
			type: "Polygon"
		}); 
		
		draw.on('drawstart', function(evt) {
			console.log("drawstart");
			MapSettings.data.aoi = undefined;
			features.clear();
		});

		draw.on('drawend', function(evt) {
			console.log("drawend");
			MapSettings.data.aoi = evt.feature.getGeometry();
		});
		
		let addPolyInteraction = function() {
			if (MapSettings.data.theMap === undefined) {
				return;
			}
			
			if (MapSettings.data.aoi != undefined) {
				features.push(new ol.Feature(MapSettings.data.aoi));
			}
			featureOverlay.setMap(MapSettings.data.theMap);
			MapSettings.data.theMap.addInteraction(modify);
			MapSettings.data.theMap.addInteraction(draw);
		}
		
		let clearPolyInteraction = function() {
			console.log("clearPolyInteraction");
			data.polyMode = false;
			if (MapSettings.data.theMap === undefined) {
				return;
			}
			
			featureOverlay.setMap(null);
			features.clear();
			MapSettings.data.theMap.removeInteraction(modify);
			MapSettings.data.theMap.removeInteraction(draw);
		}
		

		$rootScope.$on('initializingMap', function(event, data) {
			console.log('received initializingMap');
			clearBboxInteraction();
			clearPolyInteraction();
		})

		$rootScope.$on('mapInitialized', function(event, data) {
			console.log('received mapInitialized');
			if (MapSettings.data.aoi != undefined) {
				features.push(new ol.Feature(MapSettings.data.aoi));
				featureOverlay.setMap(MapSettings.data.theMap);
			}
		});
		
		

		return {
			data: data,
			iClicked: iClicked,
			layerClicked: layerClicked,
			bboxClicked: bboxClicked,
			polyClicked: polyClicked
		}
		
	});

