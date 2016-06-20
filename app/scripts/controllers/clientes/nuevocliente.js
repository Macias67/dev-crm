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
		'$rootScope', '$scope', '$filter',
		function ($rootScope, $scope, $filter) {
			var vm = this;
			
			vm.formClienteNuevo = {};
			vm.form             = {
				razonsocial : '',
				rfc         : '',
				emailempresa: '',
				tipocliente : '',
				calle       : '',
				noexterior  : '',
				nointerior  : '',
				colonia     : '',
				cp          : '',
				ciudad      : '',
				municipio   : '',
				estado      : '',
				pais        : '',
				telefono    : '',
				telefono2   : ''
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
