'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:CasosMiscasosctrlCtrl
 * @description
 * # CasosMiscasosctrlCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('MisCasosCtrl', [
		'$rootScope', '$scope', function ($rootScope, $scope) {
			//Nombres
			$rootScope.vista = {
				titulo   : 'Mis Casos',
				subtitulo: 'Gestión de mis casos'
			};
			
			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
		}
	]);
