'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.Oficina
 * @description
 * # Oficina
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('Oficina', function ($resource, CRM_APP, $auth) {
		return $resource(CRM_APP.url + 'oficinas/:id', {}, {
			get  : {
				isArray: false,
				headers: {
					'Authorization': 'Bearer ' + $auth.getToken()
				}
			},
			save : {
				method : 'POST',
				headers: {
					'Authorization': 'Bearer ' + $auth.getToken()
				}
			},
			query: {
				isArray: false,
				headers: {
					'Authorization': 'Bearer ' + $auth.getToken()
				}
			}
		});
	});
