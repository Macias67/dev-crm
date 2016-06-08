'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.oficinaservice
 * @description
 * # oficinaservice
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('oficinaService', [
		'$http', 'toastr', function ($http, toastr) {
			// Service logic
			
			var oficina = {
				calle    : '',
				numero   : '',
				colonia  : '',
				cp       : '',
				ciudad   : '',
				estado   : '',
				latitud  : '',
				longitud : '',
				telefonos: '',
				email    : ''
			};

			var instance = function () {
				return oficina;
			};
						
			var storeOficina = function () {

				App.blockUI({
					target      : 'body',
					message     : '<b> Guardando oficina </b>',
					boxed       : true,
					overlayColor: App.getBrandColor('grey')
				});

				console.info("Guardo oficina con $http");
				console.log(oficina);

				setTimeout(function () {
					App.unblockUI();
					toastr.success('Se añadió nueva oficina', 'Nueva oficina');
				}, 3000);




			};
			
			var getOficina = function (id) {
				
			};
			
			var setOficina = function (data) {
				oficina = data;
			};
			
			// Public API here
			return {
				storeOficina: function () {
					storeOficina();
				},
				getOficina  : function (id) {
					
				},
				getInstance : function () {
					return instance();
				}
			};
		}
	]);
