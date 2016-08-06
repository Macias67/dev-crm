'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:CasosCasosporasignarctrlCtrl
 * @description
 * # CasosCasosporasignarctrlCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('CasosPorAsignarCtrl', [
		'$rootScope', '$scope',
		function ($rootScope, $scope) {
		
		//Nombres
		$rootScope.vista = {
			titulo   : 'Casos por asignar',
			subtitulo: 'Casos es espera de asignación de líder'
		};
		
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageContentWhite  = false;
		$rootScope.settings.layout.pageBodySolid     = false;
		$rootScope.settings.layout.pageSidebarClosed = true;
	}]);
