angular.module('ResultsTabController', ['APIService', 'SettingsService', 'MapToolsService'])

.controller('ResultsTabController', function QueryResultsTabController($scope, $rootScope, $mdDialog, $mdToast, $http, olData, Layers, LayerGroups, MapSettings, APP_CONFIG, ProjectSettings, LayersTabSettings, MapTools, OtherInfoTool) {
	console.log("ResultsTabController enter");
	$scope.alternateLayout = false; //TODO: Currently unused. Use it or delete it
	
	$scope.data = OtherInfoTool.data;
	
	$scope.layerClicked = OtherInfoTool.layerClicked;
});
