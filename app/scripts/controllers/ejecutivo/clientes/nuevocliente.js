'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:ClientesNuevoclientectrlCtrl
 * @description
 * # ClientesNuevoclientectrlCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('NuevoClienteCtrl', [
		'$rootScope', '$scope', '$filter', 'Cliente', 'toastr', '$state',
		function ($rootScope, $scope, $filter, Cliente, toastr, $state) {
			var vm = this;
			
			vm.formClienteNuevo = {};
			vm.form             = {
				razonsocial  : '',
				rfc          : '',
				prospecto    : false,
				distribuidor: false,
				email        : '',
				calle        : '',
				noexterior   : '',
				nointerior   : '',
				colonia      : '',
				cp           : '',
				ciudad       : '',
				municipio    : '',
				estado       : '',
				pais         : '',
				telefono     : '',
				telefono2    : ''
			};

			vm.guarda = function () {
				App.scrollTop();
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Guardando cliente </b>',
					boxed       : true,
					overlayColor: App.getBrandColor('grey'),
					zIndex      : 99999
				});

				var cliente = new Cliente(vm.form);
				cliente.$save(function (response) {
					if (response.hasOwnProperty('errors')) {
						for (var key in response.errors) {
							if (response.errors.hasOwnProperty(key)) {
								toastr.error(response.errors[key][0], 'Error con el formulario.');
							}
						}
						App.unblockUI('#ui-view');
					}
					else {
						setTimeout(function () {
							App.unblockUI('#ui-view');
						}, 1000);
						toastr.success('Se registró nuevo cliente', 'Nuevo Cliente');
						$state.go('clientes');
					}
				});
			};

			$scope.$watch('nuevoClienteCtrl.form.razonsocial', function () {
				vm.form.razonsocial = $filter('uppercase')(vm.form.razonsocial);
			});
			$scope.$watch('nuevoClienteCtrl.form.rfc', function () {
				vm.form.rfc = $filter('uppercase')(vm.form.rfc);
			});
			$scope.$watch('nuevoClienteCtrl.form.emailempresa', function () {
				vm.form.emailempresa = $filter('lowercase')(vm.form.emailempresa);
			});
			$scope.$watch('nuevoClienteCtrl.form.calle', function () {
				vm.form.calle = $filter('ucfirst')(vm.form.calle);
			});
			$scope.$watch('nuevoClienteCtrl.form.noexterior', function () {
				vm.form.noexterior = $filter('uppercase')(vm.form.noexterior);
			});
			$scope.$watch('nuevoClienteCtrl.form.nointerior', function () {
				vm.form.nointerior = $filter('uppercase')(vm.form.nointerior);
			});
			$scope.$watch('nuevoClienteCtrl.form.colonia', function () {
				vm.form.colonia = $filter('ucfirst')(vm.form.colonia);
			});
			$scope.$watch('nuevoClienteCtrl.form.ciudad', function () {
				vm.form.ciudad = $filter('ucfirst')(vm.form.ciudad);
			});
			$scope.$watch('nuevoClienteCtrl.form.municipio', function () {
				vm.form.municipio = $filter('ucfirst')(vm.form.municipio);
			});
			
			//Nombres
			$rootScope.vista = {
				titulo   : 'Nuevo Cliente',
				subtitulo: 'Formulario para añadir nuevo cliente'
			};
			
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
