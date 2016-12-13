'use strict';

angular.module('login', ['ngMaterial'])
	.component('login', {
		templateUrl: 'login/login.html',
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