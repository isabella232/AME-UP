angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})


.controller('MapCtrl', function($scope) {
 /* $scope.wmsSource = new ol.source.ImageArcGISRest({
    url: 'http://services.azgs.az.gov/arcgis/rest/services/baselayers/AZWellHeadersOilGasViewer/MapServer',
    ratio: 1,
    params: {}
  });*/
    $scope.wmsSource = new ol.source.ImageWMS({
    url: 'http://services.azgs.az.gov/arcgis/services/aasggeothermal/AZWellHeaders/MapServer/WMSServer?',
             params: {
                 'LAYERS': 'Wellheader',
                     'TRANSPARENT': 'true'
             }
  });
  
  
  $scope.view = new ol.View({
    center: ol.proj.transform([ -111,32.3], 'EPSG:4326', 'EPSG:3857'),
    zoom: 6.5
  });


  $scope.map = new ol.Map({
    target: 'map',
    controls: ol.control.defaults().extend
    ([
        new ol.control.LayerSwitcher()
    ]),
    layers: [
      new ol.layer.Group({
        'title': 'Base maps',
        openInayerSwitcher: true,
        layers: [
          /*new ol.layer.Tile({
           title: 'Water color',
           type: 'base',
           visible: false,
           source: new ol.source.Stamen({
           layer: 'watercolor'
           })
           }),*/
          new ol.layer.Tile({
            title: 'OSM',
            type: 'base',
            visible: true,
            source: new ol.source.OSM()
          }),
          new ol.layer.Group({
            title: 'Satellite and labels',
            type: 'base',
            combine: true,
            visible: false,
            layers: [
              new ol.layer.Tile({
                source: new ol.source.BingMaps({
                  // Get your own key at https://www.bingmapsportal.com/
                  key: 'Ahd_32h3fT3C7xFHrqhpKzoixGJGHvOlcvXWy6k2RRYARRsrfu7KDctzDT2ei9xB',
                  imagerySet: 'Aerial'
                })
              }),
              new ol.layer.Tile({
                source: new ol.source.Stamen({
                  layer: 'terrain-labels'
                })
              })
            ]
          })
        ]
      }),
      new ol.layer.Group({
        title: 'Overlays',
        layers: [
          new ol.layer.Image({
            title: 'Wells',
            source: $scope.wmsSource
          })/*,
          new ol.layer.Image({
            title: 'seismo stations',
            source: new ol.source.ImageWMS({
              url: 'http://data.usgin.org:8086/arizona-hazards/azgs/wms',
              params: { 'LAYERS': 'seismostations' },
              serverType: 'geoserver'
            })
          })*/
        ]
      }),
      new ol.layer.Group({
        title: 'Land Ownership',
        layers: [
          new ol.layer.Image({
            title: 'Arizona Land Ownership',
            source: new ol.source.ImageArcGISRest({
              ratio: 1,
              params: {},
              url: 'http://services.azgs.az.gov/arcgis/rest/services/test/Arizona_Land_Ownership/MapServer'
            })
          })
        ]
      })
    ],
    view: $scope.view
  });


  var layerSwitcher = new ol.control.LayerSwitcher({
    //tipLabel: 'Légende' // Optional label for button
  });
  $scope.map.addControl(layerSwitcher);

  var popup = new ol.Overlay.Popup();
  $scope.map.addOverlay(popup);

  $scope.map.on('singleclick', function(evt) {
    document.getElementById('popup').innerHTML = '';
    //var prettyCoord = ol.coordinate.toStringHDMS(ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'), 2);
    //popup.show(evt.coordinate, '<div><h2>Coordinates</h2><p>' + prettyCoord + '</p></div>');

   // document.getElementById('info').innerHTML = '';
    var viewResolution = /** @type {number} */ ($scope.view.getResolution());
    $scope.wmsSource.get(name);

     var url = $scope.wmsSource.getGetFeatureInfoUrl(
            evt.coordinate, viewResolution, 'EPSG:3857',
            {'INFO_FORMAT': 'text/html'});
    if (url) {
      //document.getElementById('popup').innerHTML =
      var content = '<iframe seamless src="' + url + '"></iframe>';
        popup.show(evt.coordinate, content);
    } else {
    // maybe you hide the popup here
    popup.hide();
    }
  });
  
   $scope.map.on('pointermove', function(evt) {
        if (evt.dragging) {
          return;
        }
        var pixel = $scope.map.getEventPixel(evt.originalEvent);
        var hit = $scope.map.forEachLayerAtPixel(pixel, function() {
          return true;
        });
        $scope.map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

});
