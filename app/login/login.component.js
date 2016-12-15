'use strict';

angular.module('login', ['ngMaterial', 'AuthService'])
	.component('login', {
		templateUrl: 'login/login.html',
		controller: function LoginController($scope, Auth, $state, $mdDialog) {
			$scope.credentials = {
				username: '',
				password: '',
				password2: '',
				firstName: '',
				lastName: '',
				email: ''
			};
			
			$scope.showRegistration = false;
			
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
						
			$scope.login = function (credentials) {
				Auth.login($scope.credentials).then(function(msg) {
					console.log("logged in");
					$state.go('map');
				}, function(errMsg) {
					console.log("not logged in");
					$scope.showAlert('Login problem', errMsg);
				});
			}
			
			$scope.register = function(action) {
				console.log("action = " + action);
				if (action == 'show') {
					$scope.showRegistration = true;
				} else if (action == 'submit') {
					console.log("submitting");
					if ($scope.credentials.password != $scope.credentials.password2) {
						$scope.showAlert('Registration problem', 'Passwords do not match');
					} else {
						Auth.register($scope.credentials).then(function(msg) {
							console.log("registered");
							$scope.showAlert('Registration successful', 'Please login');
							$scope.showRegistration = false;
						}, function(errMsg) {
							console.log("not registered");
							$scope.showAlert('Registration problem', errMsg);
						});
					}
				} else { 
					$scope.showRegistration = false;
				}
			}
		}
	});