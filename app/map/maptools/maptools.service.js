'use strict';

angular.module('MapToolsService', ['APIService', 'SettingsService'])
	.factory('MapTools', function($rootScope, $mdToast, MapSettings) {
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
				showToast("Info mode not yet implemented");
				data.polyMode = false;
				data.bboxMode = false;
				clearPolyInteraction();
				clearBboxInteraction();
			}
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
				
				//TODO: This old code. Not sure it will be relevant to next implementation of info mode
				/***
				if ($scope.infoMode) {
					//$scope.layerClicked($scope.queryLayer);
					$rootScope.$emit('AOIchanged');
				}
				***/
				
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
			bboxClicked: bboxClicked,
			polyClicked: polyClicked
		}
		
	});

