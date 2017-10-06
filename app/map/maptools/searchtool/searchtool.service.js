'use strict';

angular.module('MapToolsService')
	.factory('SearchTool', function($rootScope, $mdToast, $mdDialog,  $q, MapSettings, Nominatim) {
		console.log("SearchTool init enter");

		let data = {
		}

		let showToast = function(message) {
			$mdToast.show(
				$mdToast.simple()
					.textContent(message)
					.hideDelay(3000)
			);
		};
		
		let showSearchDialog = function(event) {
			let confirm = $mdDialog.prompt()
			  .placeholder('Address or place name')
			  .ariaLabel('Address')
			  .targetEvent(event)
			  .ok('Search')
			  .cancel('Cancel');

			$mdDialog.show(confirm).then(function(result) {
			  //showToast("Search not yet implemented"); //TODO: make Geocode call here. 
				queryGeocoder(result).then(function(jsonResult) {
					if (jsonResult.length > 0) {
						//MapSettings.data.center.lat = parseFloat(jsonResult[0].lat);
						//MapSettings.data.center.lon = parseFloat(jsonResult[0].lon);
						//let oldExtent = MapSettings.data.theMap.getExtent();
						//console.log(oldExtent);
						let min = ol.proj.transform([parseFloat(jsonResult[0].boundingbox[2]), parseFloat(jsonResult[0].boundingbox[0])], 'EPSG:4326','EPSG:3857');
						let max = ol.proj.transform([parseFloat(jsonResult[0].boundingbox[3]), parseFloat(jsonResult[0].boundingbox[1])], 'EPSG:4326','EPSG:3857');
						let extent = [min[0], min[1], max[0], max[1]];
						//let extent = [parseFloat(jsonResult[0].boundingbox[2]), parseFloat(jsonResult[0].boundingbox[0]), parseFloat(jsonResult[0].boundingbox[3]), parseFloat(jsonResult[0].boundingbox[1])];
						//let extent = [-12362945.59, 3762211.07, -12323981.12, 3805514.43];
						console.log(extent);
						MapSettings.data.theMap.getView().fit(extent, MapSettings.data.theMap.getSize());
						//MapSettings.data.theMap.getView().fitExtent(extent, MapSettings.data.theMap.getSize());
					} else {
						console.log("No results found in search area");
					}
				})/*.catch(function() {
					console.log("there was a problem with geocoding");
				})*/;
			}, function() {
			  showToast("Search canceled");
			});
		}

		let queryGeocoder = function (place) {
			return $q(function(resolve, reject) {
				console.log("queryGeoCoder enter");
				let result = Nominatim.query({place: place}, function(jsonResult) {
					console.log("geocode call completed"); console.log(jsonResult);
					resolve(jsonResult);		
				},
				function(err) {
					console.log(err);
					rehect(err);
				});
			});
		}
		
		return {
			data: data,
			showSearchDialog: showSearchDialog
		}
		
	});

		