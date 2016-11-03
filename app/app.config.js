angular.module('mapApp').constant('APP_CONFIG', {
	corsProxy: '/proxy/',
	useRemote: false,
	center: { //Flagstaff
		lat: 34.3983,
		lon: -109.6513,
		zoom: 7
	},
	layersAPI: 'http://192.168.11.141:3000/api'
});

