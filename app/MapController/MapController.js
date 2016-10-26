angular.module('MapController', [])

.controller('MapController', function MapController($scope) {
	
	angular.extend($scope, {
		center: { //Flagstaff
			lat: 35.1983,
			lon: -111.6513,
			zoom: 6
		},
		layers: [
			{
				name: 'OpenStreetMap',
				active: true,
                opacity: 1.0,
				source: {
					type: 'OSM'
				}
			},
			{
				name: 'Bing - Aerial',
				active: false,
				source: {
                        type: 'BingMaps',
                        key: 'Ahd_32h3fT3C7xFHrqhpKzoixGJGHvOlcvXWy6k2RRYARRsrfu7KDctzDT2ei9xB',
                        imagerySet: 'Aerial'
				}
			},
			{
				name: 'Stamen Terrain Labels',
				active: false,
				source: {
                        type: 'Stamen',
                        layer: 'terrain-labels'
				}
			},
			{
				name: 'Wells',
				active: true,
                opacity: 0.5,
				source: {
					type: 'ImageWMS',
					params: {'LAYERS': 'Wellheader', 'TRANSPARENT': 'true', 'STYLES': ' '},
					//url: 'http://cors-anywhere.herokuapp.com/http://services.azgs.az.gov/arcgis/services/aasggeothermal/AZWellHeaders/MapServer/WMSServer'
					url: 'http://localhost:8000/proxy/http://services.azgs.az.gov/arcgis/services/aasggeothermal/AZWellHeaders/MapServer/WMSServer'
				}
			},
			{
				name: 'Land Ownership',
				active: true,
                opacity: 0.5,
				source: {
					type: 'TileArcGISRest',
					params: {},
					url: 'http://services.azgs.az.gov/arcgis/rest/services/test/Arizona_Land_Ownership/MapServer'
				}
			},
			{
				name: 'Installation Ranges',
				active: true,
                opacity: 0.5,
				source: {
					type: 'ImageWMS',
					params: {'LAYERS':'AMEUP:MILITARY_INSTALLATIONS_RANGES_TRAINING_AREAS_BND'},
					//url: 'http://10.208.3.127:8080/geoserver/AMEUP/wms'
					//url: 'http://cors-anywhere.herokuapp.com/http://Ameup.usgin.org/geoserver/web'
					url: 'http://localhost:8000/proxy/http://Ameup.usgin.org/geoserver/wms'
				}
			},
			{
				name: 'Military Training Route: Instrument Route Corridor',
				active: true,
                opacity: 0.5,
				source: {
					type: 'ImageWMS',
					params: {'LAYERS':'section368:military_training_route_ir_corridor'},
					//url: 'http://cors-anywhere.herokuapp.com/http://bogi.evs.anl.gov/geoserver/section368/wms'
					url: 'http://localhost:8000/proxy/http://bogi.evs.anl.gov/geoserver/section368/wms'
				}
			},
			{
				name: 'Areas of Critical Environmental Concern',
				active: true,
                opacity: 0.5,
				source: {
					type: 'ImageWMS',
					params: {'LAYERS':'section368:acec2'},
					//url: 'http://cors-anywhere.herokuapp.com/http://bogi.evs.anl.gov/geoserver/section368/wms'
					url: 'http://localhost:8000/proxy/http://bogi.evs.anl.gov/geoserver/section368/wms'
				}
			},
			{
				name: 'ESA-Listed Species Designated Critical Habitat Areas',
				active: true,
                opacity: 0.5,
				source: {
					type: 'ImageWMS',
					params: {'LAYERS':'section368:critical_habitat_esa_listed_species_area'},
					//url: 'http://cors-anywhere.herokuapp.com/http://bogi.evs.anl.gov/geoserver/section368/wms'
					url: 'http://localhost:8000/proxy/http://bogi.evs.anl.gov/geoserver/section368/wms'
				}
			},
			{
				name: 'ESA-Listed Species Designated Critical Habitat Lines',
				active: true,
                opacity: 0.5,
				source: {
					type: 'ImageWMS',
					params: {'LAYERS':'section368:critical_habitat_esa_listed_species_line'},
					//url: 'http://cors-anywhere.herokuapp.com/http://bogi.evs.anl.gov/geoserver/section368/wms'
					url: 'http://localhost:8000/proxy/http://bogi.evs.anl.gov/geoserver/section368/wms'
				}
			},
			{
				name: 'Solar Energy Zone',
				active: true,
                opacity: 0.5,
				source: {
					type: 'ImageWMS',
					params: {'LAYERS':'section368:developable_area_sez'},
					//url: 'http://cors-anywhere.herokuapp.com/http://bogi.evs.anl.gov/geoserver/section368/wms'
					url: 'http://localhost:8000/proxy/http://bogi.evs.anl.gov/geoserver/section368/wms'
				}
			},
			{
				name: 'Solar Energy Zone Labels',
				active: true,
                opacity: 0.5,
				source: {
					type: 'ImageWMS',
					params: {'LAYERS':'section368:developable_area_sez_point'},
					//url: 'http://cors-anywhere.herokuapp.com/http://bogi.evs.anl.gov/geoserver/section368/wms'
					url: 'http://localhost:8000/proxy/http://bogi.evs.anl.gov/geoserver/section368/wms'
				}
			}
			
		]
	});
	

});