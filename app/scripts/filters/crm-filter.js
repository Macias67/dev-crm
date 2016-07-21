'use strict';

/**
 * @ngdoc filter
 * @name MetronicApp.filter:crmFilter
 * @function
 * @description
 * # crmFilter
 * Filter in the MetronicApp.
 */
angular.module('MetronicApp')
	.filter('telefono', function () {
		return function (input) {
			if (!input) {
				return 'Sin teléfono';
			}
			
			var value = input.toString().trim().replace(/^\+/, '');
			
			if (value.match(/[^0-9]/)) {
				return input;
			}
			
			var country, city, number;
			
			switch (value.length) {
				case 10: // +1PPP####### -> C (PPP) ###-####
					country = 1;
					city    = value.slice(0, 3);
					number  = value.slice(3);
					break;
				
				case 11: // +CPPP####### -> CCC (PP) ###-####
					country = value[0];
					city    = value.slice(1, 4);
					number  = value.slice(4);
					break;
				
				case 12: // +CCCPP####### -> CCC (PP) ###-####
					country = value.slice(0, 3);
					city    = value.slice(3, 5);
					number  = value.slice(5);
					break;
				
				default:
					return input;
			}
			
			if (country == 1) {
				country = "";
			}
			
			number = number.slice(0, 3) + '-' + number.slice(3);
			
			return (country + " (" + city + ") " + number).trim();
		};
	});

