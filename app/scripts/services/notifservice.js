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
					var messaging = firebase.messaging();
					messaging.requestPermission()
						.then(function () {
							return messaging.getToken();
						})
						.then(function (token) {
							console.log(token)
						})
						.catch(function (err) {
							console.log(err);
						});
					
					messaging.onMessage(function (payload) {
						var notificacion = null;
						switch (payload.data.tipo) {
							case "success":
								notificacion = success;
								break;
							case "info":
								notificacion = info;
								break;
							case "warning":
								notificacion = warning;
								break;
							case "error":
								notificacion = error;
								break;
						}
						notificacion(payload.notification.body, payload.notification.title);
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
