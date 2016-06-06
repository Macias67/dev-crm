'use strict';

angular.module('MetronicApp').controller('DashboardController', function ($rootScope, $scope, $http, $timeout, $auth, NgMap, GeoCoder, toastr) {
	$scope.$on('$viewContentLoaded', function () {
		// initialize core components
		App.initAjax();
	});
	
	var vm = this;
	vm.center = '[40.74, -74.18]';


	//Nombres
	$rootScope.vista = {
		titulo   : 'Bienvenido',
		subtitulo: 'Gestión general'
	};
	
	// set sidebar closed and body solid layout mode
	$rootScope.settings.layout.pageContentWhite  = false;
	$rootScope.settings.layout.pageBodySolid     = false;
	$rootScope.settings.layout.pageSidebarClosed = true;
	
	$scope.payload = $auth.getPayload();

// 		NgMap.getMap().then(function (map) {
// 			console.log(map.getCenter().lat());
// 			console.log('markers', map.markers);
// 			console.log('shapes', map.shapes);
// 		});
	
	GeoCoder.geocode({address: 'ocotlán jalisco mexico'}).then(function (result) {
		//... do something with result
		
		var lat = result[0].geometry.location.lat();
		var lng = result[0].geometry.location.lng();

		vm.center = result[0].geometry.location;
		
		toastr.info('Lat: ' + lat + "\n Lng: " + lng, 'Ubicación');
	});
	}
);