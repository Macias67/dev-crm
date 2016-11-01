'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.TareaTiempos
 * @description
 * # TareaTiempos
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('TareaTiempos', [
		'$resource', 'CRM_APP', 'authUser',
		function ($resource, CRM_APP, authUser) {
			return $resource(CRM_APP.url + 'tareas/:idtarea/tiempos/:idtiempo',
				{idtarea: '@idtarea', idtiempo: '@idtiempo'},
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
