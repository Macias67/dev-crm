'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.oficinaservice
 * @description
 * # oficinaservice
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('oficinaservice', [
		'$resource', 'CRM_APP',function ($resource, CRM_APP) {
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
			
			var storeOficina = function (oficina) {
				console.info('Se guardó nueva oficina');
				console.log(angular.toJson(oficina, true));
				return true;
			};
			
// 			var api = function () {
// 				return $resource('http://api.crm/api/oficinas/:id', {}, {
// 					get  : {
// 						isArray: false,
// 						headers: {
// 							'Accept'       : 'application/vnd.crm.v1+json',
// 							'Authorization': 'Bearer ' + $auth.getToken(),
// 							'Content-Type' : 'application/json; charset=utf-8'
// 						}
// 					},
// 					save : {
// 						headers: {
// 							'Accept'       : 'application/vnd.crm.v1+json',
// 							'Authorization': 'Bearer ' + $auth.getToken(),
// 							'Content-Type' : 'application/json; charset=utf-8'
// 						}
// 					},
// 					query: {
// 						isArray: false,
// 						headers: {
// 							'Authorization': 'Bearer ' + $auth.getToken()
// 						}
// 					}
// 				});
// 			};
			
			// Public API here
			return {
				storeOficina: function (oficina) {
					return storeOficina(oficina);
				},
				API         : function () {
					
				}
			};
		}
	]);
