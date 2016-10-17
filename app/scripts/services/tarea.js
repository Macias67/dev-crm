'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.tarea
 * @description
 * # tarea
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('Tarea', [
		'$resource', 'CRM_APP', 'authUser',
		function ($resource, CRM_APP, authUser) {
			return $resource(CRM_APP.url + 'tareas/:idtarea',
				{idtarea: '@idtarea'},
				{
					get        : {
						isArray: false,
						headers: {
							'Authorization': 'Bearer ' + authUser.getToken()
						}
					},
					save       : {
						method : 'POST',
						headers: {
							'Authorization': 'Bearer ' + authUser.getToken()
						}
					},
					query      : {
						isArray: false,
						headers: {
							'Authorization': 'Bearer ' + authUser.getToken()
						}
					},
					update     : {
						method : 'PUT',
						headers: {
							'Authorization': 'Bearer ' + authUser.getToken()
						}
					},
					asignafecha: {
						url    : CRM_APP.url + 'tareas/:idtarea/fechas',
						method : 'PUT',
						headers: {
							'Authorization': 'Bearer ' + authUser.getToken()
						}
					}
				});
		}
	]);
