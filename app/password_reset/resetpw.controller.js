angular.module('ResetPWController', ['APIService', 'ngMaterial'])

.controller('ResetPWController', function ResetPWController($scope, $mdDialog, $mdToast, $stateParams, $q, $state, PWReset, Auth) {

	const token = $stateParams.token;
	const time = $stateParams.time;
	console.log("token = " + token);
	console.log("time = " + time);
	
	let now = new Date().getTime();
	console.log("now = " + now);
	console.log("diff = " + (now - time));
	$scope.expired = new Date().getTime() - time > 86400000;
	console.log("expired = " + $scope.expired);
		
	$scope.password1 = null;
	$scope.password2 = null;
		
	$scope.submit = function(ev, password1, password2) {
		console.log("submit, token = " + token + ", time = " + time + ", password = " + password1);
		$mdDialog.show({
			parent: angular.element(document.body),
			targetEvent: ev,
			templateUrl: 'password_reset/reset_status.dialog.html',
			controller: function($scope, $mdDialog) {
				$scope.title = "Reset Status";
				$scope.showProgress = true;
				$scope.error = false;
				
				$q(function(resolve, reject) {	
					PWReset.post({"token": token, "password": password1}, function() {resolve();}, function() {reject();});
				})
				.then(function() {
					$scope.showProgress = false; 
					$scope.error = false;
				})
				.catch(function() {
					$scope.showProgress = false;
					$scope.error = true;
				});
				
				$scope.submit = function() {
					$mdDialog.hide();
					Auth.logout();
					$state.go('cover');
				}
			}
		})
	}
	
});
