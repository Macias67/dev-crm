'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.Agenda
 * @description
 * # Agenda
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('Agenda', [
		'$resource', 'CRM_APP', 'authUser',
		function ($resource, CRM_APP, authUser) {
			return $resource(CRM_APP.url + 'agenda/:id', {id: "@id"}, {
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
				}
			});
		}
	]);
