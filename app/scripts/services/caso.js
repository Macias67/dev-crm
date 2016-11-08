'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.Caso
 * @description
 * # Caso
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('Caso', [
		'$resource', 'CRM_APP', 'authUser',
		function ($resource, CRM_APP, authUser) {
			return $resource(CRM_APP.url + 'casos/:id', {id: "@data.id"}, {
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
					headers: {
						'Authorization': 'Bearer ' + authUser.getToken()
					}
				},
				update: {
					method : 'PUT',
					headers: {
						'Authorization': 'Bearer ' + authUser.getToken()
					}
				},
				reasigna: {
					method : 'PUT',
					headers: {
						'Authorization': 'Bearer ' + authUser.getToken()
					}
				}
			});
		}
	]);
