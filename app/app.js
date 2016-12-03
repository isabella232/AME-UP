'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('mapApp', [
  'openlayers-directive',
  'MapController',
  'AccessController',
  'login',
  'ngMaterial',
  'ngResource',
  'ngMaterialAccordion'
])
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('blue-grey')
    .accentPalette('brown');
});;

