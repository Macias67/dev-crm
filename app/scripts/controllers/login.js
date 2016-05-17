'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the MetronicApp
 */
var Loginapp = angular.module('MetronicApp', [
	"ui.router"
]);

Loginapp.controller('LoginCtrl', [
	'$scope', function ($scope) {
		$scope.formLogin = {};
		$scope.formLogin.usuario = 'Macias';
	}
]);
