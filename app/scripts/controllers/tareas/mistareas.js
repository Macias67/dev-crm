'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:TareasGestiontareasprocesoctrlCtrl
 * @description
 * # TareasGestiontareasprocesoctrlCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('MisTareasCtrl', [
		'$rootScope', '$scope', '$uibModal',
		function ($rootScope, $scope, $uibModal) {
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
			});
			
			//Nombres
			$rootScope.vista = {
				titulo   : 'Mis Tareas',
				subtitulo: 'Gestión de mis tareas asignadas'
			};
			
			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
		}
	]);
