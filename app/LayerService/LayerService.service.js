'use strict';

angular.module('LayerService').
	factory('Layers', function($resource, APP_CONFIG) {
		console.log("layersAPI = " + APP_CONFIG.layersAPI);
		return $resource(APP_CONFIG.layersAPI + '/layers/:layerID'/*, {layerId:'@id'}*/);
	}).
	factory('LayerGroups', function($resource, APP_CONFIG) {
		return $resource(APP_CONFIG.layersAPI + '/layergroups/:layerGroupID'/*, {layerGroupId:'@id'}*/);
	});