'use strict';

/**
 * @ngdoc function
 * @name devCrmApp.controller:EjecutivosCtrl
 * @description
 * # EjecutivosCtrl
 * Controller of the devCrmApp
 */
var Ejecutivos = angular.module('MetronicApp');

Ejecutivos.controller('EjecutivosCtrl', [
	'$scope', function ($scope) {
		$scope.$on('$viewContentLoaded', function () {
			// initialize core components
			App.initAjax();
		});

		this.awesomeThings = [
			'HTML5 Boilerplate',
			'AngularJS',
			'Karma'
		];
	}
]);
