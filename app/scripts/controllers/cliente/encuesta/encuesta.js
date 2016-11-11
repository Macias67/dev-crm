'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:EncuestaCtrl
 * @description
 * # ClienteEncuestaEncuestactrlCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('EncuestaCtrl', [
		'$rootScope', '$scope', 'dataCaso', 'Caso', function ($rootScope, $scope, dataCaso, Caso) {
			var vm = this;
			
			if (dataCaso.$resolved) {
				vm.caso = dataCaso.data;
			}
			
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
			});
			
			//Nombres
			$rootScope.vista = {
				titulo   : 'Encuesta',
				subtitulo: 'Caso #' + vm.caso.id
			};
			
			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
		}
	]);
