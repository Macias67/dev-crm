'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.oficinaservice
 * @description
 * # oficinaservice
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('oficinaservice', function () {
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
		
		var storeOficina = function (data) {

		};

		var getOficina = function (id) {

		};

		var setOficina = function (data) {
			oficina = data;
		};

		// Public API here
		return {
			storeOficina: function (oficina) {
			},
			getOficina  : function (id) {
				
			},
			setOficina  : function (oficina) {
				setOficina(oficina);
			}
		};
	});
