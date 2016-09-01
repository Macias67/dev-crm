'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:CasosDetallecasoCtrl
 * @description
 * # CasosDetallecasoCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('DetalleCasoCtrl', [
		'$rootScope', '$scope', 'dataCaso',
		function ($rootScope, $scope, dataCaso) {
			var vm  = this;
			vm.caso = dataCaso.data;
			
			setTimeout(function () {
				App.unblockUI('#ui-view');
			}, 2000);
			
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
				App.scrollTop();
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Cargando datos del caso </b>',
					boxed       : true,
					zIndex      : 99999,
					overlayColor: App.getBrandColor('grey')
				});
				
				dataCaso.$promise.catch(function (err) {
					console.log(err);
				});
			});
			
			//Nombres
			$rootScope.vista = {
				titulo   : 'Caso #' + vm.caso.id,
				subtitulo: 'Caso del cliente ' + vm.caso.cliente.razonsocial
			};
			
			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
		}
	]);
