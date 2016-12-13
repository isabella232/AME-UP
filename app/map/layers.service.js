'use strict';

angular.module('LayerService', ['ngResource'])
//angular.module('LayerService').
	.factory('Layers', function($resource, APP_CONFIG) {
		console.log("layersAPI = " + APP_CONFIG.layersAPI);

		return $resource(APP_CONFIG.layersAPI + '/layers/:layerID'/*, {layerId:'@id'}*/);
		/*
		//TODO: this should work, but I do not see the header in the resulting GET
		return $resource(APP_CONFIG.layersAPI + '/layers/:layerID', {}, {
			get: {
				method: 'GET',
				headers: { 'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOnsiaWQiOjQsInVzZXJuYW1lIjoiZG91Z2xhc20wMSIsInBhc3N3b3JkIjoiJDJhJDEwJEhhVkF4M0ZHYzB6c2hGTW5VZXdLYk84VjhJUEdKanM5d0lOTmswYUwyTmdMNUxvSFNSY1FpIiwidXNlcl9yb2xlc19pZCI6MSwiZW1haWwiOm51bGwsImZpcnN0X25hbWUiOm51bGwsImxhc3RfbmFtZSI6bnVsbH0sImV4cCI6MTQ4MTE1MjkzOTczMn0.IMltr4Xu_RL1w-T4O8mIddNbMgy0fI1MM84AKWz4I4s' }
			}
		});
		*/
	}).
	factory('LayerGroups', function($resource, APP_CONFIG) {
		return $resource(APP_CONFIG.layersAPI + '/layergroups/:layerGroupID'/*, {layerGroupId:'@id'}*/);
	});