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
		'$rootScope', '$scope', 'dataCliente', '$window', '$uibModal',
		function ($rootScope, $scope, dataCliente, $window, $uibModal) {
			var vm     = this;
			vm.cliente = {};
			
			vm.contactos = {
				modalNuevoContacto: function (idCliente) {
					$uibModal.open({
						backdrop   : 'static',
						templateUrl: 'FormNuevoContacto.html',
						controller : 'NuevoContactoCtrl as nuevoContactoCtrl',
						resolve    : {
							idCliente: idCliente
						}
					});
				}
			};
			
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
					overlayColor: App.getBrandColor('grey')
				});
				
				dataCliente.$promise.then(function (d) {
					vm.cliente = d.data;
					setTimeout(function () {
						App.unblockUI('#ui-view');
					}, 2000);
				});
			});
		}
	])
	.controller('NuevoContactoCtrl', [
		'$rootScope', '$scope', '$uibModalInstance', 'idCliente', '$filter',
		function ($rootScope, $scope, $uibModalInstance, idCliente, $filter) {
			var vm      = this;
			vm.formContactoNuevo = {};
			vm.contacto = {
				nombre  : '',
				apellido: '',
				email   : '',
				telefono: ''
			};

			vm.guardar = function () {
				
			};
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};

			$scope.$watch('nuevoContactoCtrl.contacto.nombre', function () {
				vm.contacto.nombre = $filter('ucfirst')(vm.contacto.nombre);
			});
			$scope.$watch('nuevoContactoCtrl.contacto.apellido', function () {
				vm.contacto.apellido = $filter('ucfirst')(vm.contacto.apellido);
			});
			$scope.$watch('nuevoContactoCtrl.contacto.email', function () {
				vm.contacto.email = $filter('lowercase')(vm.contacto.email);
			});
		}
	]);
