'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.TareaAgenda
 * @description
 * # TareaAgenda
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('TareaAgenda', [
		'$resource', 'CRM_APP', 'authUser',
		function ($resource, CRM_APP, authUser) {
			return $resource(CRM_APP.url + 'tareas/:idtarea/agenda/:idagenda',
				{idtarea: '@idtarea', idagenda: '@idagenda'},
				{
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
					},
					delete: {
						method : 'DELETE',
						headers: {
							'Authorization': 'Bearer ' + authUser.getToken()
						}
					}
				});
		}
	]);