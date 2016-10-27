'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.Logger
 * @description
 * # Logger
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('Logger', [
		'$resource', 'CRM_APP', 'authUser',
		function ($resource, CRM_APP, authUser) {
			return $resource(CRM_APP.url + 'logs',
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
					}
				});
		}
	]);
