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
		'$rootScope', '$scope', '$uibModalInstance', 'idCliente', '$filter', 'Contacto', 'toastr',
		function ($rootScope, $scope, $uibModalInstance, idCliente, $filter, Contacto, toastr) {
			var vm               = this;
			vm.formContactoNuevo = {};
			vm.contacto          = {
				nombre  : '',
				apellido: '',
				email   : '',
				telefono: ''
			};

			vm.guardar = function () {
				App.scrollTop();
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Guardando cliente </b>',
					boxed       : true,
					overlayColor: App.getBrandColor('grey'),
					zIndex      : 99999
				});
				
				var contacto = new Contacto(vm.contacto);
				contacto.$save({idcliente: idCliente}, function (response) {
					if (response.hasOwnProperty('errors')) {
						for (var key in response.errors) {
							if (response.errors.hasOwnProperty(key)) {
								toastr.error(response.errors[key][0], 'Error con el formulario.');
							}
						}
						App.unblockUI('#ui-view');
					}
					else {
						$uibModalInstance.close();
						setTimeout(function () {
							App.unblockUI('#ui-view');
							toastr.success('Se registró a ' + response.data.nombre + ' como nuevo contacto.', 'Nuevo contacto en ' + response.data.cliente.razonsocial);
						}, 1000);
					}
				});
				
				console.log(vm.contacto);
			};
			vm.cancel  = function () {
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
