'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.Cronometro
 * @description
 * # Cronometro
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('Cronometro', function () {
		var meaningOfLife = 42;
		
		// Public API here
		return {
			someMethod: function () {
				return meaningOfLife;
			}
		};
	});
