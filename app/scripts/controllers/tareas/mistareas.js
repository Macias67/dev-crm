'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:TareasGestiontareasprocesoctrlCtrl
 * @description
 * # TareasGestiontareasprocesoctrlCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('MisTareasCtrl', [
		'$rootScope', '$scope', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'CRM_APP', 'authUser', '$uibModal', '$state',
		function ($rootScope, $scope, DTOptionsBuilder, DTColumnBuilder, $compile, CRM_APP, authUser, $uibModal, $state) {
			var vm = this;
			
			vm.tableTareasAsignadas = {
				dtInstance: {},
				dtOptions : DTOptionsBuilder.fromSource(CRM_APP.url + 'tareas?estatus=1&ejecutivo=' + authUser.getSessionData().id)
					.withFnServerData(function (sSource, aoData, fnCallback, oSettings) {
						oSettings.jqXHR = $.ajax({
							'dataType'  : 'json',
							'type'      : 'GET',
							'url'       : CRM_APP.url + 'tareas?estatus=1&ejecutivo=' + authUser.getSessionData().id,
							'data'      : aoData,
							'success'   : fnCallback,
							'beforeSend': function (xhr) {
								xhr.setRequestHeader('Accept', CRM_APP.accept);
								xhr.setRequestHeader('Authorization', 'Bearer ' + authUser.getToken());
							}
						});
					})
					.withLanguageSource('//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json')
					.withDataProp('data')
					.withOption('createdRow', function (row, data, dataIndex) {
						// Recompiling so we can bind Angular directive to the DT
						$compile(angular.element(row).contents())($scope);
					})
					.withOption('fnRowCallback', function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
						
					})
					.withPaginationType('bootstrap_full_number')
					.withBootstrap(),
				
				dtColumns  : [
					DTColumnBuilder.newColumn('id').withTitle('ID').withOption('sWidth', '3%'),
					DTColumnBuilder.newColumn('null').withTitle('Caso No.').renderWith(function (data, type, full) {
						return full.caso.id;
					}).withOption('sWidth', '10%'),
					DTColumnBuilder.newColumn('null').withTitle('Cliente').renderWith(function (data, type, full) {
						return full.caso.cliente.razonsocial;
					}).withOption('sWidth', '30%'),
					DTColumnBuilder.newColumn(null).withTitle('Estatus').notSortable().renderWith(function (data, type, full, meta) {
						return '<span class="label label-sm label-success bg-' + data.estatus.class + '"><b>' + data.estatus.estatus + '</b></span>';
					}).withOption('sWidth', '10%'),
					DTColumnBuilder.newColumn(null).notSortable().renderWith(function (data, type, full, meta) {
						return '<button class="btn btn-xs red-thunderbird" type="button">' +
							'<i class="fa fa-refresh"></i>&nbsp;Reasginar' +
							'</button>' +
							'<button ng-click="misTareasCtrl.abreDetalleTarea(' + data.id + ')" class="btn btn-xs yellow-casablanca" type="button">' +
							'<i class="fa fa-list"></i>&nbsp;Ver detalles' +
							'</button>';
					}).withOption('sWidth', '20%'),
				],
				reloadTable: function () {
					App.blockUI({
						target      : '#tableTareasAsignadas',
						animate     : true,
						overlayColor: App.getBrandColor('grey')
					});
					vm.tableTareasAsignadas.dtInstance.reloadData();
					setTimeout(function () {
						App.unblockUI('#tableTareasAsignadas');
					}, 1500);
				}
			};
			
			vm.tableTareasProceso = {
				dtInstance: {},
				dtOptions : DTOptionsBuilder.fromSource(CRM_APP.url + 'tareas?estatus=3&ejecutivo=' + authUser.getSessionData().id)
					.withFnServerData(function (sSource, aoData, fnCallback, oSettings) {
						oSettings.jqXHR = $.ajax({
							'dataType'  : 'json',
							'type'      : 'GET',
							'url'       : CRM_APP.url + 'tareas?estatus=3&ejecutivo=' + authUser.getSessionData().id,
							'data'      : aoData,
							'success'   : fnCallback,
							'beforeSend': function (xhr) {
								xhr.setRequestHeader('Accept', CRM_APP.accept);
								xhr.setRequestHeader('Authorization', 'Bearer ' + authUser.getToken());
							}
						});
					})
					.withLanguageSource('//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json')
					.withDataProp('data')
					.withOption('createdRow', function (row, data, dataIndex) {
						// Recompiling so we can bind Angular directive to the DT
						$compile(angular.element(row).contents())($scope);
					})
					.withOption('fnRowCallback', function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
						
					})
					.withPaginationType('bootstrap_full_number')
					.withBootstrap(),
				
				dtColumns  : [
					DTColumnBuilder.newColumn('id').withTitle('ID').withOption('sWidth', '3%'),
					DTColumnBuilder.newColumn('null').withTitle('Caso No.').renderWith(function (data, type, full) {
						return full.caso.id;
					}).withOption('sWidth', '10%'),
					DTColumnBuilder.newColumn('null').withTitle('Cliente').renderWith(function (data, type, full) {
						return full.caso.cliente.razonsocial;
					}).withOption('sWidth', '30%'),
					DTColumnBuilder.newColumn(null).withTitle('Estatus').notSortable().renderWith(function (data, type, full, meta) {
						return '<span class="label label-sm label-success bg-' + data.estatus.class + '"><b>' + data.estatus.estatus + '</b></span>';
					}).withOption('sWidth', '10%'),
					DTColumnBuilder.newColumn(null).notSortable().renderWith(function (data, type, full, meta) {
						return '<button class="btn btn-xs yellow-casablanca" type="button">' +
							'<i class="fa fa-list"></i>&nbsp;Ver detalles' +
							'</button>';
					}).withOption('sWidth', '20%'),
				],
				reloadTable: function () {
					App.blockUI({
						target      : '#tableTareasProceso',
						animate     : true,
						overlayColor: App.getBrandColor('grey')
					});
					vm.tableTareasProceso.dtInstance.reloadData();
					setTimeout(function () {
						App.unblockUI('#tableTareasProceso');
					}, 1500);
				}
			};
			
			vm.abreDetalleTarea = function (idTarea) {
				$state.go('gestion-tarea', {idtarea: idTarea});
			};
			
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
			});
			
			//Nombres
			$rootScope.vista = {
				titulo   : 'Mis Tareas',
				subtitulo: 'Gestión de mis tareas asignadas'
			};
			
			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
		}
	]);
