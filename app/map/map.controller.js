angular.module('MapController', ['APIService', 'SettingsService'])

.controller('MapController', function MapController($scope, $rootScope, $mdDialog, $mdToast, $http, olData, Layers, LayerGroups, MapSettings, APP_CONFIG, ProjectSettings, LayersTabSettings) {
	function print_call_stack() {
		var stack = new Error().stack;
		console.log("PRINTING CALL STACK");
		console.log( stack );
	}	
	
	let showToast = function(message) {
		$mdToast.show(
			$mdToast.simple()
				.textContent(message)
				.hideDelay(3000)
		);
	};
	
	let theMap;
	olData.getMap().then(map => {
		theMap = map;
		
		/**
		//Just playing with geometry here
		let geom = new ol.geom.Polygon.fromExtent([-5, -6, 5, 6]);
		console.log('geom = ');
		console.log(geom);
		let geom_GeoJSON = new ol.format.GeoJSON().writeGeometry(geom);
		console.log(geom_GeoJSON);
		let geomx = new ol.format.GeoJSON().readGeometry(geom_GeoJSON);
		console.log('geomx = ');
		console.log(geomx);
		console.log(geomx.getExtent());
		**/
		
		$scope.data.aoi = undefined;
		
		let mousePosition = new ol.control.MousePosition({
			coordinateFormat: ol.coordinate.createStringXY(2),
			projection: 'EPSG:4326',
			className: 'ol-scale-line-inner',
			target: document.getElementById('positionDisplay'),
			undefinedHTML: '&nbsp;'
		});

		map.addControl(mousePosition);

		let scaleLine = new ol.control.ScaleLine({ 
			units: 'us'
		});
		map.addControl(scaleLine);
		
		/**
		//TODO: Get single point select working
		selectSingleClick = new ol.interaction.Select();
		selectSingleClick.on('select', event => {
			console.log("single click received");
			console.log(event);
			map.removeLayer(layer);
			$scope.selectPoint = event.mapBrowserEvent.coordinate;
			if ($scope.infoMode) {
				$scope.layerClicked($scope.queryLayer);
			}
		});
		map.addInteraction(selectSingleClick);
		**/
				
		$scope.$on('initializingMap', function(event, data) {
			console.log('received initializingMap');
			clearBboxInteraction();
			clearPolyInteraction();
		})

		$scope.$on('mapInitialized', function(event, data) {
			console.log('received mapInitialized');
			if ($scope.data.aoi != undefined) {
				features.push(new ol.Feature($scope.data.aoi));
				featureOverlay.setMap(theMap);
			}
		});
		
		
	});
					
	MapSettings.initializeMap();

	$scope.center = MapSettings.data.center;
	$scope.groups = MapSettings.data.groups;
	$scope.layers = MapSettings.data.layers;
	//$scope.showAll = MapSettings.data.showAll;
	$scope.data = MapSettings.data; //Need this for showAll

	$scope.defaults = {
		interactions: {
			mouseWheelZoom: true
		},
		controls: {
			zoom: true,
			rotate: false,
			attribution: false
		},
		view: {
			//Swagged coords for a bounding box around AZ
			//Extent units must be in EPSG:3857 I think. So I used this page to convert: https://epsg.io/transform#s_srs=4326&t_srs=3857&x=-108.8774390&y=36.7459890
			extent: [-12788071.07, 3664032.74, -12132192.78, 4449227.64],
			minZoom: 7
		}
	};
		
	//scaleline does not work when added via the defaults above. Instead, we must create this object then use it with ol-control in the html
	$scope.controls = [
			//{ name: 'scaleline', active: true}
	]
	
	//TODO: Overhaul this to combine with iMode below
	$scope.infoMode = false;
	$scope.infoClicked = function() {
		console.log("info clicked");
		if (!$scope.infoMode) {
			if ($scope.boxExtent == undefined) {
				olData.getMap().then(map => {
					$scope.boxExtent = map.getView().calculateExtent(map.getSize());
					console.log("extent"); console.log($scope.boxExtent);
					console.log(ol.proj.toLonLat([$scope.boxExtent[0], $scope.boxExtent[1]]));
					console.log(ol.proj.toLonLat([$scope.boxExtent[2], $scope.boxExtent[3]]));
				});
			}

			//TODO: Showing first group is kinda dumb I think
			console.log("groups[0].name = " + $scope.groups[0].name);
			for (x = 0; x < $scope.layers.length; x++) {
				console.log("layers.group = " + $scope.layers[x].group);
				if ($scope.layers[x].group === $scope.groups[1].name) { //assumes first group is always base maps
					LayersTabSettings.data.queryLayer = $scope.layers[x].name;
					break;
				}
			}
			$scope.infoMode = true;
		} else {
			$scope.infoMode = false;
			$scope.selectedIndex = 0;
			LayersTabSettings.data.queryLayer = undefined;
		}
	}
	
	$scope.iMode = false;
	$scope.iClicked = function() {
		console.log("info clicked");
		$scope.iMode = !$scope.iMode;
		if ($scope.iMode) {
			showToast("Info mode not yet implemented");
			$scope.polyMode = false;
			$scope.bboxMode = false;
		}
	}

	$scope.bboxMode = false;
	$scope.bboxClicked = function() {
		$scope.bboxMode = !$scope.bboxMode;
		if ($scope.bboxMode) {
			$scope.polyMode = false;
			$scope.iMode = false;		
			clearPolyInteraction();
			addBboxInteraction();
		} else {
			theMap.removeInteraction(dragBox);		
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
		if (theMap === undefined) {
			return;
		}

		if ($scope.data.aoi != undefined) {
			features.push(new ol.Feature($scope.data.aoi));
		}
		featureOverlay.setMap(theMap);
		
		dragBox.on('boxend', (evt) => {
			console.log("boxend");
			document.getElementById('positionDisplay').style.visibility = "hidden";
			$scope.data.aoi = dragBox.getGeometry();			
			
			features.push(new ol.Feature($scope.data.aoi));
			featureOverlay.setMap(theMap);
			
			//TODO: This old code. Not sure it will be relevant to next implementation of info mode
			if ($scope.infoMode) {
				//$scope.layerClicked($scope.queryLayer);
				$rootScope.$emit('AOIchanged');
			}
			
		});

		// To remove the layer when start drawing a new dragbox
		dragBox.on('boxstart', (evt) => {
			$scope.selectPoint = undefined;
			features.clear();
			featureOverlay.setMap(null);
			$scope.data.aoi = undefined;
		});		

		dragBox.on('boxdrag', (evt) => {
			document.getElementById('positionDisplay').style.visibility = "visible";
		});		
		
		theMap.addInteraction(dragBox);
	}
	
	let clearBboxInteraction = function() {
		console.log("clearBboxInteraction");
		$scope.bboxMode = false;
		if (theMap === undefined) {
			console.log("clearBboxInteraction, no map");
			return;
		}
		features.clear();
		featureOverlay.setMap(null);
		theMap.removeInteraction(dragBox);		
	}

	$scope.polyMode = false;
	$scope.polyClicked = function() {
		$scope.polyMode = !$scope.polyMode;
		if ($scope.polyMode) {
			$scope.bboxMode = false;
			$scope.iMode = false;		
			clearBboxInteraction();
			addPolyInteraction();		
		} else {
			theMap.removeInteraction(draw);		
			theMap.removeInteraction(modify);		
		}
	}
	
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
	
	let modify = new ol.interaction.Modify({
		features: features,
	});
	
	modify.on('changed', function(evt) {
		console.log("changed");
		$scope.data.aoi = evt.feature.getGeometry();
	});
	
		
	let draw = new ol.interaction.Draw({
		features: features,
		type: "Polygon"
	}); 
	
	draw.on('drawstart', function(evt) {
		console.log("drawstart");
		$scope.data.aoi = undefined;
		features.clear();
	});

	draw.on('drawend', function(evt) {
		console.log("drawend");
		$scope.data.aoi = evt.feature.getGeometry();
	});
	
	let addPolyInteraction = function() {
		if (theMap === undefined) {
			return;
		}
		
		if ($scope.data.aoi != undefined) {
			features.push(new ol.Feature($scope.data.aoi));
		}
		featureOverlay.setMap(theMap);
		theMap.addInteraction(modify);
		theMap.addInteraction(draw);
	}
	
	let clearPolyInteraction = function() {
		console.log("clearPolyInteraction");
		$scope.polyMode = false;
		if (theMap === undefined) {
			return;
		}
		
		featureOverlay.setMap(null);
		features.clear();
		theMap.removeInteraction(modify);
		theMap.removeInteraction(draw);
	}

	$scope.selectedIndex = 0;
		
	/**
	//TODO: This change detection isn't working correctly. Might be worth another look at some point.
	$scope.$watch(function(){return MapSettings.data;}, 
	function(newVal, oldVal){
		if (newVal == oldVal) {
			console.log("center changed but initializing");
		} else {
			console.log("center change detected");
			ProjectSettings.data.changed++;
		}
	},
	true);
	
	ProjectSettings.data.changed = 0;
	**/
	
});