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
		$scope.$on('$viewContentLoaded', function () {
			// initialize core components
			App.initAjax();
			Login.init();
		});

		$scope.formLogin = {};
	}
]);
