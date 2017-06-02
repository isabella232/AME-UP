'use strict';

angular.module('MapToolsService', ['APIService', 'SettingsService'])
	.factory('MapTools', function($rootScope, $mdToast, $mdDialog, MapSettings, LayersTabSettings) {
		console.log("MapTools init enter");
		
		let data = {
			infoMode: false,
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
		
		let infoClicked = function() {
			console.log("info clicked");
			data.infoMode = !data.infoMode;
			if (data.infoMode) {
				data.polyMode = false;
				data.bboxMode = false;
				clearPolyInteraction();
				clearBboxInteraction();
				addInfoInteraction();
			} else {
				clearInfoInteraction();		
			}
		}
		
		let infoEventHandler = function(event) {
			console.log("single click received");
			console.log(event);
			let selectPoint = event.coordinate;
			console.log("selectPoint = "); console.log(selectPoint);
			if (data.infoMode) {
				let layer = MapSettings.data.layers.find(l => {return l.name === LayersTabSettings.data.queryLayer;});
				if (layer != null) {
					console.log(layer);
					console.log("original event = "); console.log(event.originalEvent);
					queryFeatures(layer,selectPoint, event.originalEvent); 
				} else {
					const noData = {noData: "Please select a layer to query (click layer name in the Layers tab)."};
					showInfoDialog("No Layer Selected", noData, event);
				}
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
				if (data.infoMode) {
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
			MapSettings.data.theMap.on('singleclick', infoEventHandler);
		}
		
		let clearInfoInteraction = function() {
			console.log("clearInfoInteraction");
			data.infoMode = false;
			if (MapSettings.data.theMap === undefined) {
				console.log("clearInfoInteraction, no map");
				return;
			}
			features.clear();
			featureOverlay.setMap(null);
			MapSettings.data.theMap.un('singleclick', infoEventHandler);		
		}
		
		
		let layerClicked = function(layerName) {
			console.log("layer clicked = " + layerName);
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
			
			let featureType = layer.source.params.LAYERS;
			if (featureType != undefined) {
				let split = featureType.split(":");
				featureType = split.length == 1 ? featureType : split[1];
			}
			console.log("featureType = " + featureType);

			let featureRequest = new ol.format.WFS().writeGetFeature({
				srsName: 'EPSG:3857',
				featureNS: layer.source.wfs.feature_namespace, 
				featurePrefix: layer.source.wfs.feature_prefix, 
				featureTypes: [featureType], 
				outputFormat: 'application/json',
				//Need to add the following filter, but it doesn't exist in the version of OpenLayers (3.16.0) loaded by the bower install of angular-openlayers-directive.
				//filter: ol.format.ogc.filter.intersects(paramStub.geometryName, new ol.geom.Point(thePoint), 'urn:ogc:def:crs:EPSG::3857')
			});
				
			console.log(featureRequest);
						
			//make sure its good to go
			featureRequest = featureRequest.hasChildNodes() ? featureRequest : undefined;
			
			if (featureRequest != undefined && layer.source.wfs.url != undefined) {
				//TODO: This is a terrible hack. I need to use ol.format.ogc.filter.intersects filter, but it doesn't exist in the version of OpenLayers (3.16.0) loaded by the bower install of angular-openlayers-directive. I could copy the version of openlayers I want (3.18) over the other one in bower_components, but that would break on any new bower install. So, instead, I'm hacking in the needed XML. It's ugly and I hate it but it does what I need. 
				let queryString = new XMLSerializer().serializeToString(featureRequest);
				console.log(queryString);
				let filterString = '><Filter xmlns="http://www.opengis.net/ogc"><Intersects><PropertyName>' + layer.source.wfs.geometry_name + '</PropertyName><Point xmlns="http://www.opengis.net/gml" srsName="urn:ogc:def:crs:EPSG::3857"><pos>' + thePoint[0] + ' ' + thePoint[1] + '</pos></Point></Intersects></Filter></Query>';
				console.log(filterString);
				queryString = queryString.replace("/>", filterString)
				console.log(queryString);
				
				// then post the request and add the received features to a layer
				fetch('/proxy/' + layer.source.wfs.url, {
					method: 'POST',
					//body: new XMLSerializer().serializeToString(featureRequest) //TODO: this is the one I'd use if I didn't have to hack it as above
					body: queryString
				}).then(function(response) {
					console.log(response);
					return response.json();
				}).then(function(result) {
					console.log(result);
		
					features.clear();
					let feature;
					try {
						feature = new ol.format.GeoJSON().readFeatures(result)[0];
					} catch(err) {
						console.log(err);
					}
					if (feature !== undefined) {
						features.push(feature);
						showInfoDialog(layer.name, result.features[0].properties, event);
					} else {
						const noData = {noData: "There is no feature in that location"};
						showInfoDialog(layer.name, noData, event);
					}
					
				}).catch(function(err) {
					const noData = {noData: "There was a problem communicating with the server"};
					showInfoDialog(layer.name, noData, event);
				});
			} else {
				console.log("Layer cannot be queried");
				let notQueryable = {noData:"Layer cannot be queried"};
				showInfoDialog(layer.name, notQueryable, event);
			}

		});
	
		let showInfoDialog = function(title, result, event) {
			console.log("show results");
			alert = $mdDialog.alert({
				title: title,
				locals: { title: title, result: result, keys: Object.keys(result), values: Object.values(result)  },
				controller: DialogController,
				templateUrl: 'map/maptools/results_dialog.html',
				targetEvent: event,
				ok: 'Done'
			});
			
			function DialogController($scope, $mdDialog, title, result, keys, values) {
				$scope.showJson = false;
				$scope.title = title;
				$scope.result = result;
				console.log("controller, result = "); console.log(result);
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
				data.infoMode = false;		
				clearPolyInteraction();
				clearInfoInteraction();
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
				data.infoMode = false;		
				clearBboxInteraction();
				clearInfoInteraction();
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
			infoClicked: infoClicked,
			layerClicked: layerClicked,
			bboxClicked: bboxClicked,
			polyClicked: polyClicked
		}
		
	});

