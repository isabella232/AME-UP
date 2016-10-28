'use strict';

// Register 'login' component, along with its associated controller and template
angular.
	module('login').
		component('login', {
			templateUrl: 'login/login.template.html',
			controller: function LoginController($scope) {
					console.log($scope);
				$scope.credentials = {
					username: '',
					password: ''
				};
								
				$scope.login = function (credentials) {
					if ($scope.credentials.username && $scope.credentials.password){
						$scope.$parent.isLoggedIn.value = true;
					}
				}
			}
		});