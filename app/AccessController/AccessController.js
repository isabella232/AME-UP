angular.module('AccessController', ['login'])
	.controller('AccessController', function AccessController($scope) {
		angular.extend($scope, {
				isLoggedIn: {value:false}
		});
	});
