'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the MetronicApp
 */
var Loginapp = angular.module('MetronicApp', ['authService']);

Loginapp.controller('LoginCtrl', [
	'$scope', 'authUser', function ($scope, authUser) {
		$scope.$on('$viewContentLoaded', function () {
			// initialize core components
			App.initAjax();
			Login.init();
		});

		var vm       = this;
		vm.formLogin = {
			email   : 'luismacias.angulo@gmail.com',
			password: 'secret'
		};

		vm.login = function () {
			authUser.loginApi(vm.formLogin);
		}
	}
]);
