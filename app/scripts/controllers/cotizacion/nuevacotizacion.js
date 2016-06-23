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
		'$rootScope', '$scope',
		function ($rootScope, $scope) {
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
			});
			
			var vm = this;

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
