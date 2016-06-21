'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:GestionClientesCtrl
 * @description
 * # GestionClientesCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('GestionClientesCtrl', [
		'$rootScope', '$scope', 'Cliente', 'toastr', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'CRM_APP', 'authUser',
		function ($rootScope, $scope, Cliente, toastr, DTOptionsBuilder, DTColumnBuilder, $compile, CRM_APP, authUser) {
			var vm = this;

			vm.tableClientes = {
				message   : '',
				edit      : edit,
				delete    : deleteRow,
				dtInstance: {},

				dtOptions: DTOptionsBuilder.fromSource(CRM_APP.url + 'clientes')
					.withFnServerData(serverData)
					.withLanguageSource('//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json')
					.withDataProp('data')
					.withOption('createdRow', createdRow)
					.withOption('fnRowCallback', rowCallback)
					.withPaginationType('bootstrap_full_number')
					.withBootstrap(),

				dtColumns: [
					DTColumnBuilder.newColumn('id').withTitle('ID').withOption('sWidth', '10%'),
					DTColumnBuilder.newColumn('calle').withTitle('Calle').renderWith(function (data, type, full) {
						return full.calle + ' ' + full.numero;
					}),
					DTColumnBuilder.newColumn('ciudad').withTitle('Ciudad').renderWith(function (data, type, full) {
						return full.ciudad + ', ' + full.estado;
					}),
					DTColumnBuilder.newColumn(null).notSortable().renderWith(actionsHtml).withOption('sWidth', '14%'),
				]
			};

			function serverData(sSource, aoData, fnCallback, oSettings) {
				oSettings.jqXHR = $.ajax({
					'dataType'  : 'json',
					'type'      : 'GET',
					'url'       : CRM_APP.url + 'clientes',
					'data'      : aoData,
					'success'   : fnCallback,
					'beforeSend': function (xhr) {
						xhr.setRequestHeader('Accept', CRM_APP.accept);
						xhr.setRequestHeader('Authorization', 'Bearer ' + authUser.getToken());
						xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
					}
				});
			}

			function edit(person) {
				vm.tableOficinas.message = 'You are trying to edit the row: ' + JSON.stringify(person);
				// Edit some data and call server to make changes...
				// Then reload the data so that DT is refreshed
				vm.tableOficinas.dtInstance.reloadData();
			}

			function deleteRow(person) {
				vm.tableOficinas.message = 'You are trying to remove the row: ' + JSON.stringify(person);
				// Delete some data and call server to make changes...
				// Then reload the data so that DT is refreshed
				vm.tableOficinas.dtInstance.reloadData();
			}

			function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
			}

			function createdRow(row, data, dataIndex) {
				// Recompiling so we can bind Angular directive to the DT
				$compile(angular.element(row).contents())($scope);
			}

			function actionsHtml(data, type, full, meta) {
				vm.tableOficinas.persons[data.id] = data;
				return '<button type="button" class="btn blue btn-xs" ng-click = "oficinaCtrl.openModalEditForm(' + data.id + ')">' +
					'   <i class="fa fa-edit"></i>' +
					'</button>&nbsp;' +
					'<button type="button" class="btn red btn-xs" ng-click="oficinaCtrl.deleteOficina(' + data.id + ')">' +
					'   <i class="fa fa-trash-o"></i>' +
					'</button>';
			}

			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
			});

			//Nombres
			$rootScope.vista = {
				titulo   : 'Clientes',
				subtitulo: 'Gestión de clientes'
			};

			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
		}
	]);
