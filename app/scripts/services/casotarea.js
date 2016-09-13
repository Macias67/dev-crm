'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.Tarea
 * @description
 * # Tarea
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('CasoTarea', [
		'$resource', 'CRM_APP', 'authUser',
		function ($resource, CRM_APP, authUser) {
			return $resource(CRM_APP.url + 'casos/:idcaso/tareas/:idtarea',
				{idcaso: '@idcaso', idtarea: '@idtarea'},
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
