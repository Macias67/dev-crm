'use strict';

angular.module('MetronicApp')
	.controller('DashboardController', [
		'$scope', '$rootScope', 'CotizacionFB',
		function ($scope, $rootScope, CotizacionFB) {
			var vm = this;
			
			CotizacionFB.refArray().on('value', function (snapshot) {
				vm.totalCasosPorAsignar = snapshot.numChildren();
			});
			
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
				
				vm.totalCasosPorAsignar  = 0;
				var totalCasosPorAsignar = CotizacionFB.array();
				totalCasosPorAsignar.$loaded().then(function () {
					vm.totalCasosPorAsignar = totalCasosPorAsignar.length;
				});
			});
			
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