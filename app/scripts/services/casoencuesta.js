'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.CasoEncuesta
 * @description
 * # CasoEncuesta
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('CasoEncuesta', [
		'$resource', 'CRM_APP', 'authUser',
		function ($resource, CRM_APP, authUser) {
			return $resource(CRM_APP.url + 'casos/:idCaso/encuestas', {idCaso: "@data.id"}, {
				get          : {
					isArray: false,
					headers: {
						'Authorization': 'Bearer ' + authUser.getToken()
					}
				},
				save         : {
					method : 'POST',
					headers: {
						'Authorization': 'Bearer ' + authUser.getToken()
					}
				},
				query        : {
					headers: {
						'Authorization': 'Bearer ' + authUser.getToken()
					}
				},
				update       : {
					method : 'PUT',
					headers: {
						'Authorization': 'Bearer ' + authUser.getToken()
					}
				}
			});
		}
	]);
