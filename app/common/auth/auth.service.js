angular.module('AuthService', [])
 
	.service('Auth', function($q, $http, API_ENDPOINT) {
		var LOCAL_TOKEN_KEY = 'AME-UP_Token';
		var isAuthenticated = false;
		var authToken;
	 