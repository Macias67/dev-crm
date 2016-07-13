'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.Producto
 * @description
 * # Producto
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('Producto', [
		'$resource', 'CRM_APP', 'authUser',
		function ($resource, CRM_APP, authUser) {
			return $resource(CRM_APP.url + 'productos/:id', {id: "@data.id"}, {
				get   : {
					isArray: false,
					headers: {
						'Authorization': 'Bearer ' + authUser.getToken()
					}
				},
				save  : {
					method : 'POST',
					headers: {
						'Authorization': 'Bearer ' + authUser.getToken()
					}
				},
				query : {
					isArray: false,
					headers: {
						'Authorization': 'Bearer ' + authUser.getToken()
					}
				},
				update: {
					method : 'PUT',
					headers: {
						'Authorization': 'Bearer ' + authUser.getToken()
					}
				}
			});
		}
	]);
