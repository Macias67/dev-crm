'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:ClientAppInicioDashboardCtrl
 * @description
 * # ClientAppInicioDashboardCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('DashboardCtrl', [
		'$scope', '$rootScope', 'CRM_APP', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'authUser', '$uibModal',
		function ($scope, $rootScope, CRM_APP, DTOptionsBuilder, DTColumnBuilder, $compile, authUser, $uibModal) {
			var vm = this;
			
			vm.tableCotizaciones = {
				dtInstance: {},
				dtOptions : DTOptionsBuilder.fromSource(CRM_APP.url + 'cotizaciones?estatus=1')
					.withFnServerData(function (sSource, aoData, fnCallback, oSettings) {
						oSettings.jqXHR = $.ajax({
							'dataType'  : 'json',
							'type'      : 'GET',
							'url'       : CRM_APP.url + 'cotizaciones?estatus=1',
							'data'      : aoData,
							'success'   : fnCallback,
							'beforeSend': function (xhr) {
								xhr.setRequestHeader('Accept', CRM_APP.accept);
								xhr.setRequestHeader('Authorization', 'Bearer ' + authUser.getToken());
								//xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
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
				
				dtColumns        : [
					DTColumnBuilder.newColumn('id').withTitle('Folio').withOption('sWidth', '10%'),
					DTColumnBuilder.newColumn('null').withTitle('Cliente').renderWith(function (data, type, full) {
						if (full.cxc) {
							return full.cliente.razonsocial + ' | ' + '<span class="badge badge-danger"> <b>CxC</b> </span>';
						}
						else {
							return full.cliente.razonsocial;
						}
					}),
					DTColumnBuilder.newColumn('null').withTitle('Se cotizó').renderWith(function (data, type, full) {
						var fecha = moment(full.fecha);
						return '<span am-time-ago="' + fecha + ' "></span>';
					}),
					DTColumnBuilder.newColumn('null').withTitle('Vencimiento').renderWith(function (data, type, full) {
						var fecha = moment(full.vencimiento);
						return '<span am-time-ago="' + fecha + ' " class="bold"></span>';
					}),
					DTColumnBuilder.newColumn(null).notSortable().renderWith(function (data, type, full, meta) {
						return '<button ng-click="dashboardCtrl.tableCotizaciones.openModalInfoPago(' + data.id + ')" class="btn btn-xs yellow-casablanca" type="button">' +
							'<i class="fa fa-check"></i>&nbsp;Revisar' +
							'</button>';
					}).withOption('sWidth', '14%')
				],
				reloadTable      : function () {
					
					App.blockUI({
						target      : '#tablePagos',
						animate     : true,
						overlayColor: App.getBrandColor('grey')
					});
					
					vm.tableCotizaciones.dtInstance.reloadData();
					
					setTimeout(function () {
						App.unblockUI('#tablePagos');
					}, 1500);
				},
				openModalInfoPago: function (id) {
					App.scrollTop();
					App.blockUI({
						target      : '#ui-view',
						message     : '<b> Mostrando datos de la cotización </b>',
						boxed       : true,
						overlayColor: App.getBrandColor('grey'),
						zIndex      : 99999
					});
					
					var cotizacion = Cotizacion.get({id: id}, function () {
						App.unblockUI('#ui-view');
						$uibModal.open({
							backdrop   : 'static',
							templateUrl: 'modalRevision.html',
							controller : 'ModalRevisaCtrl as modalRevisaCtrl',
							size       : 'lg',
							resolve    : {
								dtCotizacion: cotizacion.data
							}
						});
					});
				}
			};
			
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
			});
			
			//Nombres
			$rootScope.vista = {
				titulo   : 'Bienvenido',
				subtitulo: 'Gestión general'
			};
			
			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
		}
	]);
