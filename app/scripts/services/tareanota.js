'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.tareanota
 * @description
 * # tareanota
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('TareaNota', [
		'$resource', 'CRM_APP', 'authUser',
		function ($resource, CRM_APP, authUser) {
			return $resource(CRM_APP.url + 'tareas/:idtarea/notas/:idnota',
				{idtarea: '@idtarea', idnota: '@idnota'},
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
					}
				});
		}
	]);
