'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:TareasGestiontareasctrlCtrl
 * @description
 * # TareasGestiontareasctrlCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('GestionTareasCtrl', [
		'$rootScope', '$scope', '$uibModal',
		function ($rootScope, $scope, $uibModal) {
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
			});
			
			//Nombres
			$rootScope.vista = {
				titulo   : 'Gestión de tareas',
				subtitulo: 'Gestión de todas las tareas'
			};
			
			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
		}
	]);