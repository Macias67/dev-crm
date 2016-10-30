'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.Token
 * @description
 * # Token
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('Token', [
		'$resource', 'CRM_APP', 'authUser',
		function ($resource, CRM_APP, authUser) {
			return $resource(CRM_APP.url + 'tokens/:idtoken',
				{idtoken: '@idtoken'},
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
					}
				});
		}
	]);
