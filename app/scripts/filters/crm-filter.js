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
	})
	.filter('duracion', function () {
		return function (input, format, unidades) {
			if (!input) {
				return '00:00:00';
			}

// 			var d = Number(input);
// 			var h = Math.floor(d / 3600);
// 			var m = Math.floor(d % 3600 / 60);
// 			var s = Math.floor(d % 3600 % 60);
//
// 			return ((h < 10 ? "0" + h + ":" : h + ":") + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s);
			
			var unidad = '';
			switch (unidades) {
				case 's':
					unidad = 'X';
					break;
				case 'ms':
					unidad = 'x';
					break;
				
			}
			
			var now  = moment().format(unidad);
			var then = moment().format(unidad) - input;
			
			return moment.utc(moment(now, unidad).diff(moment(then, unidad))).format(format);
			
		};
	});

