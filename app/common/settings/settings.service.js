'use strict';

angular.module('SettingsService', ['APIService'])
	.factory('MapSettings', function($http, Layers, LayerGroups, APP_CONFIG) {
		console.log("MapSettings init enter");
		
		/**
		let projectID;
		let projectName;
		let center;
		let showAll;
		let groups;
		let layers;
		
		let groupActiveChange = function(group) {
			layers.forEach(function(layer) {
				if (layer.group == group.name) {
					layer.active = group.active;
				}
			});
		};
			
		let layerActiveChange = function(layer) {
			groups.forEach(function(group) {
				if (group.name == layer.group) {
					group.active = group.active || layer.active;
				}
			});
		};

		let toggleShowAllGroups = function() {
			showAll = !showAll;
		};

		let toggleShowAllLayers = function(group) {
			group.showAll = !group.showAll;
		};
		
		const resetMap = function (MapSettings) {
			console.log("resetMap enter");
			console.log("projectName = " + MapSettings.projectName);
			MapSettings.projectID = undefined;
			MapSettings.projectName = undefined;
			MapSettings.center = APP_CONFIG.center;
			MapSettings.center.lat = APP_CONFIG.initialLat;
			MapSettings.center.lon = APP_CONFIG.initialLon;
			MapSettings.center.zoom = APP_CONFIG.initialZoom;
			MapSettings.showAll = true;
			
			console.log(center);
			
			if (MapSettings.groups) {
				console.log("resetting groups array");
				MapSettings.groups.length = 0;
			} else {
				console.log("creating new groups array");
				MapSettings.groups = [];
			}
			console.log("calling API for groups");
			let remoteGroups = LayerGroups.query(function() {
				console.log("call completed");
				remoteGroups.forEach(function(group) {
					group.active = true;
					group.showAll = true;
					MapSettings.groups.push(group);
				});
			});


			//layers = [];
			if (MapSettings.layers) {
				console.log("resetting layers array");
				MapSettings.layers.length = 0;
			} else {
				console.log("creating new layers array");
				MapSettings.layers = [];
			}
			console.log("calling API for layers");
			let remoteLayers = Layers.query(function() {
				remoteLayers.forEach(function(remoteLayer) {
					let layer = {
						name: remoteLayer.name,
						group: remoteLayer.layer_group,
						active: remoteLayer.is_initially_active,
						opacity: remoteLayer.opacity ? 
							remoteLayer.opacity : 
							remoteLayer.layer_group === MapSettings.groups[0].name ? 1 : 0.5, //Base maps get full opacity, all others get half
						layerType: remoteLayer.layer_type,
						source: {
							type: remoteLayer.source_type,
							url: remoteLayer.source_url,
							legend_url: remoteLayer.legend_url,
							key: remoteLayer.key,
							layer: remoteLayer.layer,
							imagery_set: remoteLayer.imagery_set
						}
					};
					
					layer.source.params = {};
					remoteLayer.params.forEach(function(remoteParam) {
						layer.source.params [remoteParam.name] = remoteParam.value;
					});
					
					if (remoteLayer.is_cors_challenged) {
						layer.source.url = APP_CONFIG.corsProxy + layer.source.url;
						layer.source.legend_url = APP_CONFIG.corsProxy + layer.source.legend_url;
					}

					if (layer.source.type === "TileArcGISRest") {
						$http.get(layer.source.legend_url).
							success(function(data, status, headers, config) {
								layer.legend_json = data;
							}).
							error(function(data, status, headers, config) {
								layer.legend_json = "not available";
							});
					}

					console.log("layer:");
					console.log(layer);
					MapSettings.layers.push(layer);
					
				});
			});
			console.log("resetMap, projectName = " + MapSettings.projectName);
		}
		
		**/
		
		let data = {
			projectID: undefined,
			projectName: undefined,
			center: undefined,
			showAll: undefined,
			groups: undefined,
			layers: undefined
		}
		
		let groupActiveChange = function(group) {
			data.layers.forEach(function(layer) {
				if (layer.group == group.name) {
					layer.active = group.active;
				}
			});
		};
			
		let layerActiveChange = function(layer) {
			data.groups.forEach(function(group) {
				if (group.name == layer.group) {
					group.active = group.active || layer.active;
				}
			});
		};

		let toggleShowAllGroups = function() {
			data.showAll = !data.showAll;
		};

		let toggleShowAllLayers = function(group) {
			group.showAll = !group.showAll;
		};
		
		/***
		const resetMap = function () {
			console.log("resetMap enter");
			console.log("data.projectName = " + data.projectName);
			data.projectID = undefined;
			data.projectName = undefined;
			data.center = APP_CONFIG.center;
			data.center.lat = APP_CONFIG.initialLat;
			data.center.lon = APP_CONFIG.initialLon;
			data.center.zoom = APP_CONFIG.initialZoom;
			data.showAll = true;
			
			console.log("resetMap, data.center:");
			console.log(data.center);
			
			if (data.groups) {
				console.log("resetting groups array");
				data.groups.length = 0;
			} else {
				console.log("creating new groups array");
				data.groups = [];
			}
			console.log("calling API for groups");
			let remoteGroups = LayerGroups.query(function() {
				console.log("call completed");
				remoteGroups.forEach(function(group) {
					group.active = true;
					group.showAll = true;
					data.groups.push(group);
				});
			});


			//layers = [];
			if (data.layers) {
				console.log("resetting layers array");
				data.layers.length = 0;
			} else {
				console.log("creating new layers array");
				data.layers = [];
			}
			console.log("calling API for layers");
			let remoteLayers = Layers.query(function() {
				remoteLayers.forEach(function(remoteLayer) {
					let layer = {
						name: remoteLayer.name,
						group: remoteLayer.layer_group,
						active: remoteLayer.is_initially_active,
						opacity: remoteLayer.opacity ? 
							remoteLayer.opacity : 
							remoteLayer.layer_group === data.groups[0].name ? 1 : 0.5, //Base maps get full opacity, all others get half
						layerType: remoteLayer.layer_type,
						source: {
							type: remoteLayer.source_type,
							url: remoteLayer.source_url,
							legend_url: remoteLayer.legend_url,
							key: remoteLayer.key,
							layer: remoteLayer.layer,
							imagery_set: remoteLayer.imagery_set
						}
					};
					
					layer.source.params = {};
					remoteLayer.params.forEach(function(remoteParam) {
						layer.source.params [remoteParam.name] = remoteParam.value;
					});
					
					if (remoteLayer.is_cors_challenged) {
						layer.source.url = APP_CONFIG.corsProxy + layer.source.url;
						layer.source.legend_url = APP_CONFIG.corsProxy + layer.source.legend_url;
					}

					if (layer.source.type === "TileArcGISRest") {
						$http.get(layer.source.legend_url).
							success(function(data, status, headers, config) {
								layer.legend_json = data;
							}).
							error(function(data, status, headers, config) {
								layer.legend_json = "not available";
							});
					}

					console.log("layer:");
					console.log(layer);
					data.layers.push(layer);
					
				});
			});
			console.log("resetMap, data.projectName = " + data.projectName);
		}
	
		const setMap = function (projectID, projectName, zoom, lon, lat, layers, showAll) {
			console.log("resetMap enter");
			console.log("data.projectName = " + data.projectName);
			data.projectID = projectID;
			data.projectName = projectName;
			data.center = APP_CONFIG.center;
			data.center.lat = lat;
			data.center.lon = lon;
			data.center.zoom = zoom;
			data.showAll = showAll;
			
			if (data.layers) {
				console.log("resetting layers array");
				data.layers.length = 0;
			} else {
				console.log("creating new layers array");
				data.layers = [];
			}
			
			if (layers) {
				layers.forEach(layer => {
					data.layers.push(layer);
				});
			}
			
		});
		***/
		
		/***/
		const initializeMap = function (projectID, projectName, zoom, lon, lat, showAll, groups, layers) {
			console.log("resetMap enter");
			console.log("data.projectName = " + data.projectName);
			data.projectID = projectID;
			data.projectName = projectName;
			data.center = APP_CONFIG.center;
			data.center.lat = lat || APP_CONFIG.initialLat;
			data.center.lon = lon || APP_CONFIG.initialLon;
			data.center.zoom = zoom || APP_CONFIG.initialZoom;
			data.showAll = showAll || true;
			
			console.log("resetMap, data.center:");
			console.log(data.center);
						
			if (data.groups) {
				console.log("resetting groups array");
				data.groups.length = 0;
			} else {
				console.log("creating new groups array");
				data.groups = [];
			}

			if (groups) {
				groups.forEach(group => {
					data.groups.push(group);
				});
			} else {
				console.log("calling API for groups");
				let remoteGroups = LayerGroups.query(function() {
					console.log("call completed");
					remoteGroups.forEach(function(group) {
						group.active = true;
						group.showAll = true;
						data.groups.push(group);
					});
				});
			}

			if (data.layers) {
				console.log("resetting layers array");
				data.layers.length = 0;
			} else {
				console.log("creating new layers array");
				data.layers = [];
			}
			
			if (layers) {
				layers.forEach(layer => {
					data.layers.push(layer);
				});
			} else {
				console.log("calling API for layers");
				let remoteLayers = Layers.query(function() {
					remoteLayers.forEach(function(remoteLayer) {
						let layer = {
							name: remoteLayer.name,
							group: remoteLayer.layer_group,
							active: remoteLayer.is_initially_active,
							opacity: remoteLayer.opacity ? 
								remoteLayer.opacity : 
								remoteLayer.layer_group === data.groups[0].name ? 1 : 0.5, //Base maps get full opacity, all others get half
							layerType: remoteLayer.layer_type,
							source: {
								type: remoteLayer.source_type,
								url: remoteLayer.source_url,
								legend_url: remoteLayer.legend_url,
								key: remoteLayer.key,
								layer: remoteLayer.layer,
								imagery_set: remoteLayer.imagery_set
							}
						};
						
						layer.source.params = {};
						remoteLayer.params.forEach(function(remoteParam) {
							layer.source.params [remoteParam.name] = remoteParam.value;
						});
						
						if (remoteLayer.is_cors_challenged) {
							layer.source.url = APP_CONFIG.corsProxy + layer.source.url;
							layer.source.legend_url = APP_CONFIG.corsProxy + layer.source.legend_url;
						}

						if (layer.source.type === "TileArcGISRest") {
							$http.get(layer.source.legend_url).
								success(function(data, status, headers, config) {
									layer.legend_json = data;
								}).
								error(function(data, status, headers, config) {
									layer.legend_json = "not available";
								});
						}

						console.log("layer:");
						console.log(layer);
						data.layers.push(layer);
						
					});
				});
			}
			console.log("resetMap, data.projectName = " + data.projectName);
		}
		/***/
	
		//resetMap(); //TODO: Having this here is causing API calls before login, resulting in 401 errors
		
		return {
			data: data,
			initializeMap: initializeMap,
			groupActiveChange: groupActiveChange,
			layerActiveChange: layerActiveChange,
			toggleShowAllGroups: toggleShowAllGroups,
			toggleShowAllLayers: toggleShowAllLayers
		}
	})//;
	.factory('ProjectSettings', function($http, Layers, LayerGroups, APP_CONFIG) {
		console.log("ProjectSettings init enter");

		let data = {
			currentProjectID: undefined,
			currentProjectName: undefined,
			projects: undefined
		}
		
		const fetchProjects = function() {
			console.log("fetchProjects, enter");
			if (data.projects) {
				data.projects.length = 0;
			} else {
				data.projects = [];
			}
			let remoteProjects = Projects.query(function() {
				console.log("fetchProjects, remoteProjects:");
				console.log(remoteProjects);
				remoteProjects.forEach(function(remoteProject) {
					let project = {
						id: remoteProject.id,
						name: remoteProject.name,
						zoom: remoteProject.zoom_level,
						centerLon: remoteProject.center_lon,
						centerLat: remoteProject.center_lat,
						showAll: remoteProject.show_all,
						groups: angular.fromJson(remoteProject.groups),
						layers: angular.fromJson(remoteProject.layers),
						modifiedDate: remoteProject.modified_date
					}
					console.log(project);
					data.projects.push(project);
				});
			});
			console.log("fetchProjects, projects:");
			console.log(data.projects);
		}
		
		fetchProjects();
		
		return {
			data: data,
			fetchProjects: fetchProjects
		}
		
		
	});
