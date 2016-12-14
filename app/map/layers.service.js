'use strict';

angular.module('LayerService', ['ngResource'])
	.factory('Layers', function($resource, APP_CONFIG) {
		console.log("layersAPI = " + APP_CONFIG.layersAPI);

		return $resource(APP_CONFIG.layersAPI + '/layers/:layerID', {layerID:'@id'}, {
			query: {
				method: 'GET',
				isArray: true,
				headers: { 'Authorization': 'Bearer ' + window.localStorage.getItem(APP_CONFIG.tokenKey) } 
			},
			get: {
				method: 'GET',
				isArray: false,
				headers: { 'Authorization': 'Bearer ' + window.localStorage.getItem(APP_CONFIG.tokenKey) } 
			}
		});
	})
	.factory('LayerGroups', function($resource, APP_CONFIG) {
		return $resource(APP_CONFIG.layersAPI + '/layergroups/:layerGroupID', {layerGroupID:'@id'}, {
			query: {
				method: 'GET',
				isArray: true,
				headers: { 'Authorization': 'Bearer ' + window.localStorage.getItem(APP_CONFIG.tokenKey) } 
			},
			get: {
				method: 'GET',
				isArray: false,
				headers: { 'Authorization': 'Bearer ' + window.localStorage.getItem(APP_CONFIG.tokenKey) } 
			}
		});
	})
	.factory('User', function($resource, APP_CONFIG) {
		return $resource(APP_CONFIG.layersAPI + '/users/:userID', {userID:'@id'}, {
			register: {
				method: 'POST',
				isArray: false,
				params:{signup: true}
			},
			authenticate: {
				method: 'POST',
				isArray: false
			},
			get: {
				method: 'GET',
				isArray: false,
				headers: { 'Authorization': 'Bearer ' + window.localStorage.getItem(APP_CONFIG.tokenKey) } 
			}
		});
		
	});