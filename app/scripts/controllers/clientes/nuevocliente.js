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
		'$rootScope', '$scope',
		function ($rootScope, $scope) {
			var vm = this;

			vm.formClienteNuevo = {};
			vm.form = {
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
				telefonos   : ''
			};


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
