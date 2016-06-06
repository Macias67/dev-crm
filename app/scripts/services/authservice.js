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
	.factory('authUser', function ($auth, $state, $rootScope, sessionControl, toastr) {
		
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
				target: 'body',
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
				target: 'body',
				message     : '<b> Iniciando Sesión </b>',
				boxed       : true,
				overlayColor: App.getBrandColor('grey')
			});

			$auth.signup(loginForm).then(
				function (response) {
					//console.log(angular.toJson(response.data.data, true));

					$auth.setToken(response.data.data.token);
					delete response.data.data.token;
					storeSession(angular.toJson(response.data.data));

					setTimeout(function () {
						App.unblockUI();
						$state.go('dashboard');
					}, 3000);
				},
				function (error) {
					App.unblockUI();
					deleteSession();
					
					toastr.error(error.data.message, 'Ups...');
				}
			);
		};
		
		return {
			loginApi      : function (loginForm) {
				login(loginForm);
			},
			getSessionData: function () {
				return getSession();
			},
			logout        : function () {
				logout();
			}
		}
	});
