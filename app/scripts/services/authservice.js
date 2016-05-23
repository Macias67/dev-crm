'use strict';

/**
 * @ngdoc service
 * @name devCrmApp.authService
 * @description
 * # authService
 * Service in the devCrmApp.
 */
angular.module('authService', [])
	.service('authUser', function ($auth) {
		var login = function (loginForm) {
			$auth.login(loginForm).then(
				function (response) {
					console.log(response);
				},
				function (error) {
					console.log(error);
				}
			);
		};
		
		return {
			loginApi: function (loginForm) {
				login(loginForm);
			}
		}
	});
