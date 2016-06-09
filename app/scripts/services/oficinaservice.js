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
		
		var instance = function () {
			return oficina;
		};
		
		var storeOficina = function (oficina) {
			console.info('Se guardó nueva oficina');
			console.log(angular.toJson(oficina, true));
			return true;
		};
		
		// Public API here
		return {
			getInstance : function () {
				return instance();
			},
			storeOficina: function (oficina) {
				return storeOficina(oficina);
			}
		};
	});
