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
		'$rootScope', '$scope', '$stateParams',
		function ($rootScope, $scope, $stateParams) {
			var vm = this;
			vm.rfcParam = $stateParams.rfc;

			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;

			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
			});
		}
	]);
