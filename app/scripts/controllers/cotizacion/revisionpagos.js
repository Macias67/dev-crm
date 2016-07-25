'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:CotizacionRevisionpagosctrlCtrl
 * @description
 * # CotizacionRevisionpagosctrlCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('RevisionPagosCtrl', [
		'$rootScope', '$scope', 'Cliente', 'toastr', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'CRM_APP', 'authUser', '$uibModal',
		function ($rootScope, $scope, Cliente, toastr, DTOptionsBuilder, DTColumnBuilder, $compile, CRM_APP, authUser, $uibModal) {
			var vm = this;
			
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
			});
			
			//Nombres
			$rootScope.vista = {
				titulo   : 'Pagos por revisar',
				subtitulo: 'Cotizaciones pagadas'
			};
			
			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
		}
	]);
