angular.module('ReportsTabController', ['APIService', 'SettingsService', 'ngMaterial'])

.controller('ReportsTabController', function ReportsTabController($scope, $rootScope, Projects, MapSettings, ProjectSettings, Reports, APP_CONFIG, $mdDialog, $mdToast)
{
	$scope.reportClicked = function(event, type) {
		//console.log("reportClicked, boxExtent = " + $scope.boxExtent);
		console.log(event);
		if (MapSettings.data.aoi == undefined) {
			showAOIalert(event);
		} else {
			showReportDialog(event, type);
		}
	}
	
    let showAOIalert = function(event) {
 		console.log("show AOI alert");
		alert = $mdDialog.alert({
			title: 'AOI required',
			textContent: 'Please specify an Area of Interest first.',
			targetEvent: event,
			ok: 'Ok'
		});

		$mdDialog
			.show( alert )
			.finally(function() {
				alert = undefined;
			});
    }
	
    let showReportDialog = function(event, type) {
		//TODO: The alert dialog here is just a stub. This will need to be a custom dialog.
 		console.log("show report");
		alert = $mdDialog.alert({
			title: type.charAt(0).toUpperCase() + type.slice(1) + ' Report',
			//textContent: '<tabular results here>',
			locals: { reportName: type.charAt(0).toUpperCase() + type.slice(1) },
			controller: DialogController,
			templateUrl: 'tabs/reports/report_dialog.html',
			targetEvent: event,
			ok: 'Done'
		});
		function DialogController($scope, $mdDialog, reportName) {
			$scope.reportName = reportName;
			//$scope.results = '<tabular results here>';
			//TODO: Probably should hit the Reports endpoing from a service rather than here
			//TODO: Show a spinner in dialog until results come back
			//TODO: Process returned json into a tabular structure of some sort
			$scope.results = Reports.get({report: 'contact', filter: '{"type":"Polygon","coordinates":[[[-110.71287778,32.27194444],[-109.19132222,32.27194444],[-109.19132222,33.01055556],[-110.71287778,33.01055556],[-110.71287778,32.27194444]]]}'});
			$scope.closeDialog = function() {
				$mdDialog.hide();
			}
		}

		$mdDialog
			.show( alert )
			.finally(function() {
				alert = undefined;
			});
	}
	
});