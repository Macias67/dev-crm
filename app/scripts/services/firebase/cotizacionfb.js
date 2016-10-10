'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.firebase/CotizacionFB
 * @description
 * # firebase/CotizacionFB
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('CotizacionFB', [
		'$firebaseArray', '$firebaseObject', 'NotifService',
		function ($firebaseArray, $firebaseObject, NotifService) {
			
			var array = function () {
				return $firebaseArray(firebase.database().ref('cotizacion'));
			};
			
			var refArray = function () {
				return firebase.database().ref('cotizacion');
			};
			
			var notificacion = function () {
				var solonuevas = false;
				
				
				refArray().on('child_added', function (snapshotCotizacion) {
					var cotizacion, cliente;
					if (!solonuevas) {
						return;
					}
					
					cotizacion = snapshotCotizacion.val();
					firebase.database().ref('clientes/' + cotizacion.cliente_id).once('value', function (snapshotCliente) {
						console.log(snapshotCliente.val());
						cliente = snapshotCliente.val();
						if (cotizacion.estatus_id == 1) {
							// @Todo solo cliente correspondiente
							NotifService.info('Se ha abierto un nuevo caso para el cliente <b>' + cliente.razonsocial + '</b> en espera de asignación de líder.', 'Caso en espera de líder.');
						}
					});
				});
				
				refArray().on('value', function (snapshot) {
					solonuevas = true;
				});
			};
			
			var lengthCasosPorAsignar = function () {
				refArray().on('value', function (snapshot) {
					return snapshot.numChildren();
				});
			};
			
			return {
				array                : array,
				object               : function (id) {
					return $firebaseObject(firebase.database().ref('cotizacion/' + id));
				},
				refArray             : refArray,
				refObject            : function (id) {
					return firebase.database().ref('cotizacion/' + id);
				},
				toArray              : function (refArray) {
					return $firebaseArray(refArray);
				},
				toObject             : function (refObject) {
					return $firebaseObject(refObject);
				},
				notificacion  : notificacion,
				lengthCasosPorAsignar: lengthCasosPorAsignar
			}
		}
	]);
