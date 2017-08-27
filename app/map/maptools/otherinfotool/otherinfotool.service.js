'use strict';

angular.module('MapToolsService')
	.factory('OtherInfoTool', function($rootScope, $mdDialog, $q, MapSettings, LayersTabSettings) {
		console.log("OtherInfoTool init enter");

		let data = {
			active: false //TODO: Not fully used outside of this file. I'm thinking it should replace the mode booleans in MapTools.
		}

		//TODO: Had to abandon use of ol.Collection because it has performance issues on clear(). This is probably a better way to go anyhow. But, it conflicts with my use of features in the bbox and poly tools. For now, I'm fixing the obvious problem. Look into making this consistent throughout.
		let features2 = new ol.source.Vector();
		let featureOverlay2 = new ol.layer.Vector({
			source: features2,
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
		
		let markers = new ol.Collection();
		let markersOverlay = new ol.layer.Vector({
			source: new ol.source.Vector({features: markers}),
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
						color: '#ff0000'//'#ffcc33'
					})
				})
			})
		});
		
		$rootScope.$on('queryLayerHidden', function(event, data) {
			console.log('received queryLayerHidden');
			features2.clear();
		});

		let infoEventHandler = function(event) {
			console.log("single click received");
			console.log(event);
			let selectPoint = event.coordinate;
			console.log("selectPoint = "); console.log(selectPoint);
			markers.clear();
			markers.push(new ol.Feature({geometry: new ol.geom.Point(selectPoint)}));
			if (data.active) {
				/*
				getLayersAtCoord(selectPoint).then(function(res) { //TODO: Move this to showInfoDialog
					console.log("Done!");console.log(res)}
				);
				*/
				showInfoDialog(selectPoint, event.originalEvent);
				
			}				
		}		
		
		let addInteraction = function() {
			data.active = true;
			clearQueryLayerWhenDone = false;
			featureOverlay2.setMap(MapSettings.data.theMap);
			markersOverlay.setMap(MapSettings.data.theMap);
			MapSettings.data.theMap.on('singleclick', infoEventHandler);
		}
		
		let clearInteraction = function() {
			console.log("clearInfoInteraction");
			data.active = false;
			if (MapSettings.data.theMap === undefined) {
				console.log("clearInfoInteraction, no map");
				return;
			}
			
			if (clearQueryLayerWhenDone) {
				MapSettings.data.layers.some(function(layer) {
					if (layer.name === LayersTabSettings.data.queryLayer) {
						layer.visible = false;
					}
				});
				clearQueryLayerWhenDone = false;
			}
			
			features2.clear();
			featureOverlay2.setMap(null);
			markers.clear();
			markersOverlay.setMap(null);
			MapSettings.data.theMap.un('singleclick', infoEventHandler);		
		}
		
		let clearQueryLayerWhenDone = false;
		let layerClicked = function(layerName) {
			console.log("layer clicked = " + layerName);
			
			//first clear old layer from map if it wasn't active before
			if (clearQueryLayerWhenDone) {
				MapSettings.data.layers.some(function(layer) {
					if (layer.name === LayersTabSettings.data.queryLayer) {
						layer.visible = false;
					}
				});
				clearQueryLayerWhenDone = false;
			}
						
			MapSettings.data.layers.some(function(layer) {
				if (layer.name === layerName) {
					clearQueryLayerWhenDone = !layer.visible; //If layer is not initially visible then we should clear it when done					
					layer.visible = true;
					MapSettings.layerActiveChange(layer);
					LayersTabSettings.data.queryLayer = layerName;
					if (markers.getLength() > 0) {
						showInfoDialog(layer, markers.item(0).getGeometry().getFirstCoordinate());
					}
				}
			});
		}		
		
		let showInfoDialog = function(selectPoint, event) { //TODO: Modify to use getLayersAtCoord
			console.log("show info dialog");
			
			let parent = angular.element(document.querySelector('#mapContent'));
			console.log("parent");console.log(parent);
			
			let	alert = $mdDialog.alert({
					//parent: parent,
					title: "Layers here",
					locals: { thePoint: selectPoint },
					controller: DialogController,
					templateUrl: 'map/maptools/otherinfotool/results_dialog.html',
					targetEvent: event,
					ok: 'Done'
			});

			function DialogController($scope, $mdDialog, thePoint) {
				console.log("dialog enter");
				$scope.alternateLayout = false;
				$scope.title = "Layers here";
				$scope.selectedIndex = -1;
				getLayersAtCoord(selectPoint).then(function(result) { 
					console.log("Done!");console.log(result)
					if (result) {
						$scope.result = result;
					}
				});
				$scope.closeDialog = function() {
					$mdDialog.hide();
				}
				
				$scope.layerClicked = function(index) {
					console.log("layer clicked, index = " + index);
					$scope.selectedIndex = index;
					$scope.features = $scope.result[index].featuresAtCoord;
					$scope.keys = Object.keys($scope.features[0].properties);
					$scope.valuesList = [];
					$scope.features.forEach(function(r) {
						let values;
						//Yes, I am being obstinate in including this use of Object.values when the old stuff will work in all browsers. That's me: obstinate.
						if (Object.values) {
							values = Object.values(r.properties);
						} else { //IE
							values = [];
							Object.keys(features[0].properties).forEach(function(key) {values.push(r.properties[key])});
						}
						$scope.valuesList.push(values);
					});
					console.log("keys"); console.log($scope.keys);
					console.log("valuesList"); console.log($scope.valuesList);
					
					//TODO: add features to map
					/***
					features2.clear();
					let features;
					try {
						features = new ol.format.GeoJSON().readFeatures($scope.features);
						console.log("features");console.log(features);
					} catch(err) {
						console.log(err);
					}
					if (features.length > 0) {
						features2.addFeatures(features);
					}
					***/
					
				}
			}

			$mdDialog
				.show( alert )
				.catch(function() {}) //swallows reject error when we programmatically open new dialog over old
				.finally(function() {
					alert = undefined;
				});
			
		}
					

		let getLayersAtCoord = (function(thePoint) {
			return $q(function(resolve, reject) {

				//Set buffer appropriate to zoom level
				console.log("zoom level = " + MapSettings.data.theMap.getView().getZoom());
				let buffer;
				switch (MapSettings.data.theMap.getView().getZoom()) {
					case 7: {
						buffer = 10000;
						break;
					}
					case 8: {
						buffer = 5000;
						break;
					}
					case 9: {
						buffer = 1000;
						break;
					} 
					case 10: {
						buffer = 700;
						break;
					}
					default: {
						buffer = 500;
						break;
					}
				}
				
				//Create list of feature sources (unique wfs servers) for layers that are currently visible, with their featureTypes and layers
				//TODO: This could be moved to separate routine
				let featureSources = MapSettings.data.layers.reduce(function(sources, layer) {
					console.log("processing layer " + layer.name);
					console.log("source url = " + layer.source.url);
					if (layer.visible && 
						layer.source.wfs.url) {
						const layerShadow = {"name": layer.name, "source": layer.source};
						const key = layer.source.wfs.url + "-" + layer.source.wfs.feature_namespace + "-" + layer.source.wfs.feature_prefix;
						console.log("key = " + key);
						let featureType = layer.source.params.LAYERS;
						if (featureType != undefined) {
							let split = featureType.split(":");
							featureType = split.length == 1 ? featureType : split[1];
						}
						console.log("featureType = " + featureType);

						if (sources[key]) {
							console.log("adding to existing source " + key + " with layer.name " + layer.name + " and featureType " + featureType);
							sources[key].featureTypes.push(featureType);
							sources[key].layers.push(layerShadow);
						} else {
							console.log("adding new source " + key + " with layer.name " + layer.name + " and featureType " + featureType);
							//sources = [];
							sources[key] = {"featureTypes":[featureType], "layers":[layerShadow]};
						}
					}
					//console.log("sources = "); console.log(sources);
					return sources;
				}, []);		
				
				console.log("featureSources = ");console.log(featureSources);
				
				let featureSourcePromises = Object.keys(featureSources).map(function(key, index, array) {
					return $q(function(resolve, reject) {					
						const featureSource = featureSources[key];
						console.log("processing featureSource "); console.log(featureSource);

						//TODO: Building request and fetching it could be in separate routine
						let featureRequest = new ol.format.WFS().writeGetFeature({
							srsName: 'EPSG:3857',
							featureNS: featureSource.layers[0].source.wfs.feature_namespace, 
							featurePrefix: featureSource.layers[0].source.wfs.feature_prefix, 
							featureTypes: featureSource.featureTypes,
							outputFormat: 'application/json',
							//Need to add the following filter, but it doesn't exist in the version of OpenLayers (3.16.0) loaded by the bower install of angular-openlayers-directive.
							//filter: ol.format.ogc.filter.intersects(paramStub.geometryName, new ol.geom.Point(thePoint), 'urn:ogc:def:crs:EPSG::3857')
							filter: ol.format.ogc.filter.bbox(featureSource.layers[0].source.wfs.geometry_name, [thePoint[0]-buffer, thePoint[1]-buffer, thePoint[0]+buffer, thePoint[1]+buffer], 'urn:ogc:def:crs:EPSG::3857')
						});
						console.log("featureRequest = ");
						console.log(featureRequest);

						//make sure its good to go
						featureRequest = featureRequest.hasChildNodes() ? featureRequest : undefined;
									
						if (featureRequest != undefined && featureSource.layers[0].source.wfs.url != undefined) {
							try {
								//Try fetch first (not available in IE)
								//Yes, I am being obstinate in including this code when the old stuff will work in all browsers. That's me: obstinate.
								fetch('/proxy/' + featureSource.layers[0].source.wfs.url, {
									method: 'POST',
									body: new XMLSerializer().serializeToString(featureRequest) //TODO: this is the one I'd use if I didn't have to hack the filter as above
									//body: queryString //For use with the xml hack above
								}).then(function(response) {
									console.log(response);
									return response.json();
								}).then(function(result) {
									console.log(result);
									if (result.features.length > 0) {
										featureSource.layers = processWFSResult(result, featureSource); 
									} else {
										featureSource.layers = null;
									}
									resolve();
								}).catch(function(err) {
									featureSource.layers = null;
									resolve();
								})
							} catch(err) { //If fetch is not available, this is IE
								let request = new XMLHttpRequest();
								request.onload = function() {
									let result = JSON.parse(this.responseText);
									console.log(result);
									if (result.features.length > 0) {
										featureSource.layers = processWFSResult(result, featureSource);
									} else {
										featureSource.layers = null;
									}	
									resolve();
								};
								request.onerror = function(err) {
									console.log("server problem:"); console.log(err);
									featureSource.layers = null;
									resolve();
								};
								request.open('POST', '/proxy/' + layer.source.wfs.url, true);
								request.send(new XMLSerializer().serializeToString(featureRequest));
							}
						
						}
					});
				});
				
				$q.all(featureSourcePromises).then(function() {
					console.log(featureSources);
					console.log(Object.keys(featureSources));
					let layersWithFeatures = Object.keys(featureSources).reduce(function(layers, key) {
						let featureSource = featureSources[key];
						console.log("featureSource = " + featureSource);
						let newLayers = featureSource.layers === null ? [] : featureSource.layers.filter(function(layer, index, array) {
							console.log("layer.name = " + layer.name);
							return layer.featuresAtCoord;
						});
						
						Array.prototype.push.apply(layers, newLayers);
						
						return layers;
					}, []);
					console.log("layersWithFeatures"); console.log(layersWithFeatures);
					resolve(layersWithFeatures);
				});

			});
		});
		
		let processWFSResult = function(result, featureSource) {		
			result.features.forEach(function(feature) {
				let layerName = feature.id.split('.')[0];
				console.log("layerName = " + layerName);
				featureSource.layers = featureSource.layers.map(function(layer, index, array) {
					let featureType = layer.source.params.LAYERS;
					if (featureType != undefined) {
						let split = featureType.split(":");
						featureType = split.length == 1 ? featureType : split[1];
					}
					if (featureType === layerName) {
						if (layer.featuresAtCoord) {
							layer.featuresAtCoord.push(feature);
						} else {
							layer.featuresAtCoord = [feature];
						}
					}
					return layer;
				});
				
			});
			
			
			const returnLayersCollection = featureSource.layers.filter(function(layer) {
				return layer.featuresAtCoord
			});
			
			console.log("returnLayersCollection = "); console.log(returnLayersCollection);
			return returnLayersCollection;
		}
		
		
		return {
			data: data,
			addInteraction: addInteraction,
			clearInteraction: clearInteraction,
			layerClicked: layerClicked
		}
		
	});
