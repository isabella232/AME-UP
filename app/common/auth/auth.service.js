angular.module('AuthService', ['LayerService'])
 
	.service('Auth', function($q, $http, User, APP_CONFIG) {
		const TOKEN_KEY = APP_CONFIG.tokenKey;
		let isAuthenticated = false;
		let authToken;
	 
		function loadToken() {
			let token = window.localStorage.getItem(TOKEN_KEY);
			if (token) {
				useToken(token);
			}
		}
		
		function storeToken(token) {
			console.log("storeToken, token = " + token);
			window.localStorage.setItem(TOKEN_KEY, token);
			useToken(token);
		}
		
		function useToken(token) {
			isAuthenticated = true;
			authToken = token;
		}
		
		function destroyToken() {
			authToken = undefined;
			isAuthenticated = false;
			window.localStorage.removeItem(TOKEN_KEY);
		}
		
		let register = function(user) {
			return $q(function(resolve, reject) {
				User.register({username:user.username, password:user.password, firstName:user.firstName, lastName:user.lastName, email:user.email}, function(user){resolve(user.msg);}, function(response){reject(response.data.msg);});
			});
		}

		let login = function(user) {
			return $q(function(resolve, reject) {
				console.log("calling User.authenticate");
				User.authenticate({username:user.username, password:user.password}, function(user){storeToken(user.token); resolve(user.msg);}, function(response){reject(response.data.msg);});
			});
		}
		
		let logout = function() {
			console.log("Auth.logout");
			destroyToken();
		}
		
		loadToken();
		
		return {
			login: login,
			register: register,
			logout: logout,
			isAuthenticated: function() {return isAuthenticated;}
		}
	})
	
	.factory('AuthInterceptor', function($rootScope, $q, AUTH_EVENTS) {
		return {
			responseError: function(response) {
				$rootScope.$broadcast({
					401: AUTH_EVENTS.notAuthenticated
				}[response.status], response);
				return $q.reject(response);
			}
		};
	})
	.config(function ($httpProvider) {
		$httpProvider.interceptors.push('AuthInterceptor');
	});
		
		