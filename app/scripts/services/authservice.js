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
	.factory('authUser', function ($auth, $state, sessionControl) {
		
		var storeSession = function (data) {
			sessionControl.set('ec_data', data);
		};

		/**
		 * Todo Promesa para obtener datos del ejecutivo si no estan en sessionStorage
		 * @returns {Object|Array|string|number}
		 */
		var getSession = function () {
			return angular.fromJson(sessionControl.get('ec_data'));
		};
		
		var deleteSession = function () {
			sessionControl.unset('ec_data');
		};
		
		var login = function (loginForm) {
			$auth.signup(loginForm).then(
				function (response) {
					console.log(angular.toJson(response.data.data, true));
					
					$auth.setToken(response.data.data.token);
					
					delete response.data.data.token;
					storeSession(angular.toJson(response.data.data));
					$state.go('dashboard');
				},
				function (error) {
					console.error(error);
					deleteSession();
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
			logout : function () {
				$auth.logout();
				deleteSession();
				$state.go('login');
			}
		}
	});
