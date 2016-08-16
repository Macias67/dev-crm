'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.Lider
 * @description
 * # Lider
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('Lider', function ($resource, CRM_APP, authUser) {
		return $resource(CRM_APP.url + 'casos/:idCaso/lider', {idCaso: "@id"}, {
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
			valida: {
				url    : CRM_APP.url + 'cotizaciones/:idCotizacion/pagos/:id/valida',
				method : 'PUT',
				headers: {
					'Authorization': 'Bearer ' + authUser.getToken()
				}
			}
		});
	});
