'use strict';

/**
 * @ngdoc function
 * @name devCrmApp.controller:GestorGeneralOficinasCtrl
 * @description
 * # GestorGeneralOficinasCtrl
 * Controller of the devCrmApp
 */
angular.module('MetronicApp')
	.controller('OficinasCtrl', [
		'DTOptionsBuilder', 'DTColumnBuilder', '$resource', function (DTOptionsBuilder, DTColumnBuilder, $resource) {
			var vm = this;
			vm.dtOptions = DTOptionsBuilder.fromFnPromise(function () {
				return $resource('http://beta.json-generator.com/api/json/get/Vyh1La-mW').query().$promise;
			}).withPaginationType('full_numbers');

			vm.dtColumns = [
				DTColumnBuilder.newColumn('id').withTitle('ID'),
				DTColumnBuilder.newColumn('firstName').withTitle('First name'),
				DTColumnBuilder.newColumn('lastName').withTitle('Last name').notVisible()
			];
		}
	]);
