'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.Contacto
 * @description
 * # Contacto
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('Contacto', [
		'$resource', 'CRM_APP', 'authUser',
		function ($resource, CRM_APP, authUser) {
			return $resource(CRM_APP.url + 'clientes/:idcliente/contactos/:idcontacto',
				{idcliente: '@idcliente', idcontacto: '@data.idcontacto'}, {
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
