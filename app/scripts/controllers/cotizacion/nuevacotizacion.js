'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:CotizacionNuevacotizacionctrlCtrl
 * @description
 * # CotizacionNuevacotizacionctrlCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('NuevaCotizacionCtrl', [
		'$rootScope', '$scope', '$http',
		function ($rootScope, $scope, $http) {
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
			});
			
			var vm = this;
			
			// Any function returning a promise object can be used to load values asynchronously
			$scope.getLocation = function (val) {
				return $http.get('//maps.googleapis.com/maps/api/geocode/json', {
					params: {
						address: val,
						sensor : false
					}
				}).then(function (response) {
					return response.data.results.map(function (item) {
						return item.formatted_address;
					});
				});
			};

			//Nombres
			$rootScope.vista = {
				titulo   : 'Bienvenido',
				subtitulo: 'Gestión general'
			};

			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
		}
	]);
