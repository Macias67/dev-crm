'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.firebase/NotaFB
 * @description
 * # firebase/NotaFB
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('NotaFB', [
		'$firebaseArray', '$firebaseObject', 'NotifService',
		function ($firebaseArray, $firebaseObject, NotifService) {
			var REF   = 'nota';
			
			var array = function () {
				return $firebaseArray(firebase.database().ref(REF));
			};
			
			var refArray = function () {
				return firebase.database().ref(REF);
			};
			
			var notifCasoPorAsignar = function () {
				var solonuevas = false;
				refArray().on('child_added', function (snapshot) {
					if (!solonuevas) {
						return;
					}
					// @Todo solo asginador de casos verá esto
					NotifService.info('Se ha abierto un nuevo caso para el cliente <b>' + snapshot.val().cliente.razonsocial + '</b> en espera de asignación de líder.', 'Caso #' + snapshot.key + ' en espera de líder.');
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
					return $firebaseObject(firebase.database().ref(REF + '/' + id));
				},
				refArray             : refArray,
				refObject            : function (id) {
					return firebase.database().ref(REF + '/' + id);
				},
				toArray              : function (refArray) {
					return $firebaseArray(refArray);
				},
				toObject             : function (refObject) {
					return $firebaseObject(refObject);
				},
				notifCasoPorAsignar  : notifCasoPorAsignar,
				lengthCasosPorAsignar: lengthCasosPorAsignar
			}
		}
	]);
