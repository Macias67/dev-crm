'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.NotifService
 * @description
 * # NotifService
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('NotifService', [
		'toastr', 'ngAudio', '$auth',
		function (toastr, ngAudio, $auth) {
			
			var success = function (mensaje, titulo) {
				ngAudio.load('sounds/chord.mp3').play();
				toastr.success(mensaje, titulo);
			};
			
			var info = function (mensaje, titulo) {
				ngAudio.load('sounds/beep.mp3').play();
				toastr.info(mensaje, titulo);
			};
			
			var warning = function (mensaje, titulo) {
				ngAudio.load('sounds/ping.mp3').play();
				toastr.warning(mensaje, titulo);
			};
			
			var error = function (mensaje, titulo) {
				ngAudio.load('sounds/cool.mp3').play();
				toastr.error(mensaje, titulo);
			};
			
			var fbNotificacion = function () {
				if ($auth.isAuthenticated()) {
					var solonuevas = false;
					var notiRef    = firebase.database().ref('notificaciones');
					notiRef.on('child_added', function (snapshot) {
						if (!solonuevas) {
							return;
						}
						
						var notifData = snapshot.val();
						
						switch (notifData.tipo) {
							case "success":
								notifData.tipo = success;
								break;
							case "info":
								notifData.tipo = info;
								break;
							case "warning":
								notifData.tipo = warning;
								break;
							case "error":
								notifData.tipo = error;
								break;
						}
						
						notifData.tipo(notifData.mensaje, notifData.titulo);
						
						console.log(snapshot.val());
					});
					notiRef.on('value', function () {
						solonuevas = true;
					});
				}
			};
			
			return {
				success       : success,
				info          : info,
				warning       : warning,
				error         : error,
				fbNotificacion: fbNotificacion
			};
		}
	]);
