'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.OficinaFB
 * @description
 * # OficinaFB$firebaseArray
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('OficinaFB', function ($firebaseObject, $firebaseArray) {
		
		function root() {
			return $firebaseArray(firebase.database().ref().child('oficinas'));
		}
		
		function set(oficina) {
			firebase.database().ref('oficinas').push(oficina);
		}
		
		return {
			root: root,
			set : set
		};
	});
