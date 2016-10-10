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
		'$rootScope', '$auth', '$state', 'sessionControl', 'NotifService', 'ngAudio', 'PermPermissionStore', 'PermRoleStore',
		function ($rootScope, $auth, $state, sessionControl, NotifService, ngAudio, PermPermissionStore, PermRoleStore) {
			
			var storeSession = function (data) {
				sessionControl.set('ec_data', data);
			};
			
			var getSession = function () {
				return angular.fromJson(sessionControl.get('ec_data'));
			};
			
			var deleteSession = function () {
				PermPermissionStore.clearStore();
				PermRoleStore.clearStore();
				sessionControl.unset('ec_data');
				$auth.logout();
			};
			
			var logout = function () {
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
							var data     = response.data.data;
							var permisos = [];
							
							angular.forEach(data.roles, function (value, key) {
								angular.forEach(data.roles[key].permisos, function (pValue, pKey) {
									permisos[pKey] = pValue.nombre;
									PermPermissionStore.definePermission(pValue.nombre, function () {
										return true;
									});
								});
								PermRoleStore.defineRole(value.nombre, permisos);
							});
							
							$auth.setToken(data.token);
							delete data.token;
							storeSession(angular.toJson(data));
							
							setTimeout(function () {
								App.unblockUI();
								if (data.ejecutivo != null) {
									$state.go('dashboard');
								}
								else if (data.cliente != null) {
									$state.go('panel-cliente');
								}
								ngAudio.load('sounds/intro.mp3').play();
							}, 3000);
						}
					})
					.catch(function (response) {
						console.log(response);
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
