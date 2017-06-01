angular.module('MapController', ['APIService', 'SettingsService', 'MapToolsService'])

.controller('MapController', function MapController($scope, $rootScope, $mdDialog, $mdToast, $http, olData, Layers, LayerGroups, MapSettings, APP_CONFIG, ProjectSettings, LayersTabSettings, MapTools) {
	function print_call_stack() {
		var stack = new Error().stack;
		console.log("PRINTING CALL STACK");
		console.log( stack );
	}	
	
	//TODO: delete this when not needed
	let showToast = function(message) {
		$mdToast.show(
			$mdToast.simple()
				.textContent(message)
				.hideDelay(3000)
		);
	};
		
	olData.getMap().then(map => {
		MapSettings.data.theMap = map;
		
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
	
	//TODO: Overhaul this to combine with iMode in MapTools
	/***
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
	***/
	$scope.infoMode = MapTools.data.iMode;

	
	$scope.toolsData = MapTools.data;
	$scope.iMode = MapTools.data.iMode;
	$scope.iClicked = MapTools.iClicked;
	$scope.bboxMode = MapTools.data.bboxMode;
	$scope.bboxClicked = MapTools.bboxClicked;
	$scope.polyMode = MapTools.data.polyMode;
	$scope.polyClicked = MapTools.polyClicked;


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