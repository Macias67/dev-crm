'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.Cliente
 * @description
 * # Cliente
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('Cliente', function ($resource, CRM_APP, authUser) {
		return $resource(CRM_APP.url + 'clientes/:id', {id: "@data.id"}, {
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
	});
