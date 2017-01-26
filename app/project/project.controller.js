angular.module('ProjectController', ['APIService', 'SettingsService', 'ngMaterial'])

.controller('ProjectController', function ProjectController($scope, Projects, MapSettings, APP_CONFIG, $mdDialog, $mdToast) {

	$scope.projects;
	
	let getProjects = function() {
		console.log("getProjects, enter");
		if ($scope.projects) {
			$scope.projects.length = 0;
		} else {
			$scope.projects = [];
		}
		let remoteProjects = Projects.query(function() {
			console.log("getProjects, remoteProjects:");
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
				$scope.projects.push(project);
			});
		});
		console.log("getProjects, projects:");
		console.log($scope.projects);
	}
	
	getProjects();

	/**
	$scope.showAlert = function(titleText, bodyText) {
		$mdDialog.show(
			$mdDialog.alert()
				.parent(angular.element(document.querySelector('#popupContainer')))
				.clickOutsideToClose(true)
				.title(titleText)
				.textContent(bodyText)
				.ariaLabel(titleText)
				.ok('Ok')
		);
	};
	**/
	
	$scope.showToast = function(message) {
		$mdToast.show(
			$mdToast.simple()
				.textContent(message)
				.hideDelay(3000)
		);
	};

	setMap = function(selectedProject) {
		if (selectedProject) {
			console.log("resetMap, selectedProject = " + selectedProject);
			let theProject;
			console.log("resetMap, projects.length = " + $scope.projects.length);
			$scope.projects.forEach( project => {
				console.log("resetMap, project = " + project.name);
				if (project.id == selectedProject) {
					theProject = project;
					//TODO: throw here to break loop?
				}
			});
			console.log("resetMap, theProject = " + theProject.name);
			MapSettings.initializeMap(theProject.id, theProject.name, theProject.zoom, theProject.centerLon, theProject.centerLat, theProject.showAll, theProject.groups, theProject.layers);
		} else {
			MapSettings.initializeMap();
		}
	};
	
	/**
	$scope.resetMap = function(selectedProject) {
		if (selectedProject) {
			console.log("resetMap, selectedProject = " + selectedProject);
			let theProject;
			console.log("resetMap, projects.length = " + $scope.projects.length);
			$scope.projects.forEach( project => {
				console.log("resetMap, project = " + project.name);
				if (project.id == selectedProject) {
					theProject = project;
					//TODO: throw here to break loop?
				}
			});
			console.log("resetMap, theProject = " + theProject.name);
			MapSettings.resetMap(theProject.id, theProject.name, theProject.zoom, theProject.centerLon, theProject.centerLat, theProject.layers, theProject.showAll);
		} else {
			MapSettings.resetMap();
			$scope.showToast('New project created');
		}
	};
	**/

	$scope.newProject = function(ev) {
		console.log("openProject enter");
		setMap();
		$scope.showToast('New project created');
	}
	
	$scope.openProject = function(ev) {
		console.log("openProject enter");
		
		$mdDialog.show({
			parent: angular.element(document.body),
			targetEvent: ev,
			templateUrl: 'project/open.project.html',
			controller: ($scope, $mdDialog) => {
				$scope.tmpSelect;
		
				$scope.cancel = function() {
					$mdDialog.cancel();
				};
				$scope.answer = function(answer) {
					$mdDialog.hide(answer);
				}
			}
		})
		.then((answer) => {
			setMap(answer);
		}, {});
		
  };
  
  /**
  $scope.showTabDialog = function(ev) {
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'tabDialog.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true
    })
        .then(function(answer) {
          $scope.status = 'You said the information was "' + answer + '".';
        }, function() {
          $scope.status = 'You cancelled the dialog.';
        });
		
	}
	**/
	
	$scope.saveProject = function(ev) {
		console.log("saveProject, MapSettings.data.projectName = " + MapSettings.data.projectName);
		if (!MapSettings.data.projectName) {
			const confirm = $mdDialog.prompt()
				.title('Project Name')
				.textContent('What would you like to call this project?')
				.placeholder('Project name')
				.ariaLabel('Project name')
				.targetEvent(ev)
				.ok('Submit')
				.cancel('Cancel');

			$mdDialog.show(confirm).then(function(result) {
				//TODO: check preexisting name
				//MapSettings.data.projectName = result;
				const name = result;
				Projects.create(
					{
						name: name, //MapSettings.data.projectName,
						zoomLevel: MapSettings.data.center.zoom,
						centerLon: MapSettings.data.center.lon,
						centerLat: MapSettings.data.center.lat,
						showAll: MapSettings.data.showAll,
						groups: angular.toJson(MapSettings.data.groups),
						layers: angular.toJson(MapSettings.data.layers)
					},
					function(result) {
						MapSettings.data.projectName = name;
						MapSettings.data.projectID = result.id;
						getProjects();
						$scope.showToast('Project saved');
					},
					function() {
						$scope.showToast('There was a problem. Project not saved.');
					}
				);
			}, function() {
			});
		} else {
			Projects.update(
				{projectID: MapSettings.data.projectID},
				{
					name: MapSettings.data.projectName,
					zoomLevel: MapSettings.data.center.zoom,
					centerLon: MapSettings.data.center.lon,
					centerLat: MapSettings.data.center.lat,
					showAll: MapSettings.data.showAll,
					groups: angular.toJson(MapSettings.data.groups),
					layers: angular.toJson(MapSettings.data.layers)
				},
				function() {
					$scope.showToast('Project saved');
					getProjects();
				},
				function() {
					$scope.showToast('There was a problem. Project not saved.');
				}
			);
		}		
	};

	
	$scope.deleteProject = function(ev) {
		if (MapSettings.data.projectName) {
			const confirm = $mdDialog.confirm()
				.title('Delete Project')
				.textContent('Are you sure you want to delete this project? This cannot be undone.')
				.ariaLabel('Delete project')
				.targetEvent(ev)
				.ok('Yes')
				.cancel('No');

			$mdDialog.show(confirm).then(function() {
				Projects.delete(
					{projectID: MapSettings.data.projectID},
					function(result) {
						//TODO: remove from local list?
						console.log("deleteProject, MapSettings.data.projectName = " + MapSettings.data.projectName);
						getProjects();
						setMap();
						$scope.showToast('Project deleted');
					},
					function() {
						$scope.showToast('There was a problem. Project not deleted.');
					}
				);
			}, function() {
			});
		} else {
			//TODO:???
			console.log("What, no project name?");
		}
	}

	
});
