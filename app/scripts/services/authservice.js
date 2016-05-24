'use strict';

/**
 * @ngdoc service
 * @name devCrmApp.authService
 * @description
 * # authService
 * Service in the devCrmApp.
 */
angular.module('authService', [])
	.service('authUser', function ($auth, $state) {
		var login = function (loginForm) {
			$auth.signup(loginForm).then(
				function (response) {
					console.log(response.data.data);
					$auth.setToken(response.data.data.token);
					$state.go('dashboard');
				},
				function (error) {
					console.error('Error: ' + error);
				}
			);
		};
		
		return {
			loginApi: function (loginForm) {
				login(loginForm);
			}
		}
	});
