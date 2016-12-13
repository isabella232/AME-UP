'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('mapApp', [
  'openlayers-directive',
  'MapController',
  'AccessController',
  'login',
  'ngMaterial',
  'ngResource',
  'ngMaterialAccordion',
  'ui.router'
])
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('blue-grey')
    .accentPalette('brown');
})
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('cover', {
    url: '/',
    templateUrl: 'views/cover.html'
  })
  .state('map', {
    url: '/map',
    templateUrl: 'views/map.html',
	controller: 'MapController'
  });
 
  $urlRouterProvider.otherwise('/');
})
;/*
.run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
    if (!AuthService.isAuthenticated()) {
      console.log(next.name);
      if (next.name !== 'outside.login' && next.name !== 'outside.register') {
        event.preventDefault();
        $state.go('outside.login');
      }
    }
  });
});
*/
