angular.module('LayersTabController', ['APIService', 'SettingsService', 'ngMaterial'])

.controller('LayersTabController', function LayersTabController($scope, $rootScope, Projects, MapSettings, ProjectSettings, APP_CONFIG, $mdDialog, $mdToast)
{
	$scope.queryLayer = undefined;
	$scope.queryResults = [];
	$scope.selectedIndex = 0;

	//TODO: move all this into layers table and pull from each layer
	let bogiFeatureParams = {
		featureNamespace:	'section368',
		featurePrefix:		'section368',
		outputFormat:		'application/json',
		geometryName:		'geom',
		queryURL:			'http://bogi.evs.anl.gov/geoserver/section368/wfs'
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
	
	let queryFeatures = (layer => {
		//TODO: parse fields of layer to fill out below.
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

		/**
		let filter;
		if ($scope.selectPoint != undefined) {
			filter = ol.format.ogc.filter.intersects(paramStub.geometryName, new ol.geom.Point($scope.selectPoint), 'urn:ogc:def:crs:EPSG::3857')
		} else {
			filter = ol.format.ogc.filter.bbox(paramStub.geometryName, $scope.boxExtent, 'urn:ogc:def:crs:EPSG::3857')
		}
		**/
		let featureRequest = new ol.format.WFS().writeGetFeature({
			srsName: 'EPSG:3857',
			featureNS: paramStub.featureNamespace,
			featurePrefix: paramStub.featurePrefix,
			featureTypes: [featureType], 
			outputFormat: 'application/json',
			//ogc is not in most of the examples and docs online, but is necessary (https://github.com/openlayers/openlayers/pull/5653)
			//filter: ol.format.ogc.filter.bbox(paramStub.geometryName, $scope.boxExtent, 'urn:ogc:def:crs:EPSG::3857')
			filter: ol.format.ogc.filter.bbox(paramStub.geometryName, MapSettings.data.aoi.getExtent(), 'urn:ogc:def:crs:EPSG::3857')
			//filter: filter
		});
			
		//make sure its good to go
		console.log(featureRequest);
		featureRequest = featureRequest.hasChildNodes() ? featureRequest : undefined;
		
		if (featureRequest != undefined && paramStub.queryURL != undefined) {
			// then post the request and add the received features to a layer
			fetch('/proxy/' + paramStub.queryURL, {
				method: 'POST',
				body: new XMLSerializer().serializeToString(featureRequest)
			}).then(function(response) {
				console.log(response);
				return response.json();
				//return response.text();
			}).then(function(json) {
				console.log(json);
				//$scope.queryResults = JSON.stringify(json);
				
				//$scope.queryResults[0] = ["No features"];
				json.features.forEach((feature, index, array) => {
					$scope.queryResults[index] = JSON.stringify(feature.properties, null, 4);
					console.log($scope.queryResults[index]);
				});
	
				$scope.$apply();
	
				//TODO: see if this works for feature display
				/**
				var features = new ol.format.GeoJSON().readFeatures(json);
				vectorSource.addFeatures(features);
				map.getView().fit(vectorSource.getExtent());
				**/
			});
		} else {
			let noData = {noData:"Layer cannot be queried"};
			$scope.queryResults[0] = JSON.stringify(noData, null, 4);//"Layer cannot be queried";
		}

	});
	
	$scope.layerClicked = function(layerName) {
		console.log("layer clicked = " + layerName);
		$scope.queryLayer = layerName;
		$scope.queryResults = [];
		let layer = MapSettings.layers.find(l => {return l.name === layerName;});
		if (layer != null) {
			console.log(layer);
			//Disabling this for now
			queryFeatures(layer); 
		}
	}
	
    $rootScope.$on("AOIchanged", function(){
		$scope.layerClicked($scope.queryLayer);
	});
	
});