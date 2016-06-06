'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:DepartamentosCtrl
 * @description
 * # DepartamentosCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('DepartamentosCtrl', [
		'$rootScope', function ($rootScope) {
			//Nombres
			$rootScope.vista = {
				titulo   : 'Departamentos',
				subtitulo: 'Gestión de departamentos'
			};

			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
		}
	]);
