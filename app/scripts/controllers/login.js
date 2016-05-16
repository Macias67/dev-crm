'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the MetronicApp
 */
var app = angular.module('MetronicApp', []);

app.controller('LoginCtrl', [
	'$scope', function ($scope) {
		$scope.formLogin = {};
		$scope.formLogin.usuario = 'Macias';
	}
]);
