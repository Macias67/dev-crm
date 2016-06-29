'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:ClientesPerfilclientectrlCtrl
 * @description
 * # ClientesPerfilclientectrlCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('PerfilClienteCtrl', [
		'$rootScope', '$scope', 'dataCliente',
		function ($rootScope, $scope, dataCliente) {
			var vm      = this;
			vm.cliente = {};

			dataCliente.$promise.then(function (d) {
				vm.cliente = d.data;
				console.log(d.data);

				setTimeout(function () {
					App.unblockUI('#ui-view');
				}, 2000);
			});



			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
			
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
				App.scrollTop();
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Cargando datos del cliente </b>',
					boxed       : true,
					zIndex      : 99999,
					overlayCSS: {
						backgroundColor: App.getBrandColor('grey'),
						opacity        : 0.4,
						cursor         : 'wait'
					}
				});
				console.log(dataCliente);
			});
		}
	]);
