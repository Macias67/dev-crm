'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.Unidades
 * @description
 * # Unidades
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('Unidades', [
		'$resource', 'CRM_APP', 'authUser',
		function ($resource, CRM_APP, authUser) {
			return $resource(CRM_APP.url + 'unidades/:id', {id: "@data.id"}, {
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
