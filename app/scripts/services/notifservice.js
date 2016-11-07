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
		'toastr', 'ngAudio', 'authUser', 'Token',
		function (toastr, ngAudio, authUser, Token) {
			
			ngAudio.setUnlock(false);
			
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
				if (authUser.isAuthenticated()) {
					var messaging = firebase.messaging();
					messaging.requestPermission()
						.then(function () {
							return messaging.getToken();
						})
						.then(function (token) {
							var deviceToken = localStorage.getItem('deviceToken');
							var idToken     = localStorage.getItem('idToken');
							if ((deviceToken == null || deviceToken == undefined || deviceToken == "undefined") || (idToken == null || idToken == undefined || idToken == "undefined")) {
								Token.save({
									id_usuario: authUser.getSessionData().id,
									token     : token
								}).$promise.then(function (response) {
									localStorage.setItem('deviceToken', response.data.token);
									localStorage.setItem('idToken', response.data.id);
									info('Token guardado correctamente.', 'Ahora pordrás recibir notificaciones.');
								}, function (response) {
									error('Error al guardar el token.', response.statusText + ' (' + response.status + ')');
									setTimeout(function () {
										location.reload();
									}, 1000);
								});
							}
						})
						.catch(function (err) {
							warning('Este navegador aún no es compatible para recibir notificaciones, te sugerimos usar Chrome.', 'Navegador incompatible.');
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
					
					messaging.onTokenRefresh(function () {
						messaging.getToken()
							.then(function (refreshedToken) {
								var deviceToken = localStorage.getItem('deviceToken');
								var idToken     = localStorage.getItem('idToken');
								
								Token.update({
									id_token  : idToken,
									id_usuario: authUser.getSessionData().id,
									token     : refreshedToken
								}).$promise.then(function (response) {
									localStorage.setItem('deviceToken', response.data.token);
									localStorage.setItem('idToken', response.data.id);
									info('Token guardado correctamente.', 'Ahora pordrás recibir notificaciones.');
								}, function (response) {
									error('Error al guardar el token.', response.statusText + ' (' + response.status + ')')
								});
								
								info('Se ha actualizado correctamente el token.', 'Token actualizado.');
							})
							.catch(function (err) {
								console.log('Unable to retrieve refreshed token ', err);
								showToken('Unable to retrieve refreshed token ', err);
							});
					});
					
				}
				else {
					console.log('aok');
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
