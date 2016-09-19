'use strict';

/**
 * @ngdoc service
 * @name devCrmApp.authService
 * @description
 * # authService
 * Service in the devCrmApp.
 */
angular.module('authService', [])
	.factory('sessionControl', function () {
		return {
			get  : function (key) {
				return localStorage.getItem(key);
			},
			set  : function (key, val) {
				return localStorage.setItem(key, val);
			},
			unset: function (key) {
				return localStorage.removeItem(key);
			}
		};
	})
	.factory('authUser', [
		'$rootScope', '$auth', '$state', 'sessionControl', 'NotifService', 'ngAudio', function ($rootScope, $auth, $state, sessionControl, NotifService, ngAudio) {
			
			var storeSession = function (data) {
				sessionControl.set('ec_data', data);
			};
			
			var getSession = function () {
				return angular.fromJson(sessionControl.get('ec_data'));
			};
			
			var deleteSession = function () {
				sessionControl.unset('ec_data');
			};
			
			var logout = function () {
				
				$auth.logout();
				deleteSession();
				
				App.blockUI({
					target      : 'body',
					message     : '<b> Cerrando Sesión </b>',
					boxed       : true,
					overlayColor: App.getBrandColor('grey')
				});
				
				setTimeout(function () {
					App.unblockUI();
					$state.go('login');
				}, 3000);
			};
			
			var login = function (loginForm) {
				
				App.blockUI({
					message     : '<b> Iniciando Sesión </b>',
					boxed       : true,
					overlayColor: App.getBrandColor('grey')
				});
				
				/**
				 * @TODO Validar que la respuesta tenga el token de JWT
				 */
				
				$auth.signup(loginForm)
					.then(function (response) {
						if (response != null || response != undefined) {
							//console.log(angular.toJson(response.data.data, true));
							$auth.setToken(response.data.data.token);
							delete response.data.data.token;
							storeSession(angular.toJson(response.data.data));
							
							setTimeout(function () {
								App.unblockUI();
								if (response.data.data.esCliente) {
									$state.go('panel-cliente');
								}
								else {
									$state.go('dashboard');
								}
								ngAudio.load('sounds/intro.mp3').play();
							}, 3000);
						}
					})
					.catch(function (response) {
// 						console.log(response);
// 						App.unblockUI();
// 						deleteSession();
// 						NotifService.error(error.data.message, 'Ups...');
					});
			};
			
			var isAuthenticated = function () {
				return $auth.isAuthenticated();
			}
			
			var getToken = function () {
				return $auth.getToken();
			};
			
			return {
				loginApi       : function (loginForm) {
					login(loginForm);
				},
				isAuthenticated: function () {
					return isAuthenticated();
				},
				getSessionData : function () {
					return getSession();
				},
				getToken       : function () {
					return getToken();
				},
				logout         : function () {
					logout();
				}
			}
		}
	]);
