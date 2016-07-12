'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:ProductosGestionproductosCtrl
 * @description
 * # ProductosGestionproductosCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('GestionProductosCtrl', [
		'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$auth', '$filter', '$scope', '$rootScope', '$uibModal', 'CRM_APP', 'authUser', '$ngBootbox', 'toastr',
		function (DTOptionsBuilder, DTColumnBuilder, $compile, $auth, $filter, $scope, $rootScope, $uibModal, CRM_APP, authUser, $ngBootbox, toastr) {
			var vm = this;
			
			vm.tableProductos = {
				dtInstance: {},
				dtOptions  : DTOptionsBuilder.fromSource(CRM_APP.url + 'productos')
					.withFnServerData(function (sSource, aoData, fnCallback, oSettings) {
						oSettings.jqXHR = $.ajax({
							'dataType'  : 'json',
							'type'      : 'GET',
							'url'       : CRM_APP.url + 'productos',
							'data'      : aoData,
							'success'   : fnCallback,
							'beforeSend': function (xhr) {
								xhr.setRequestHeader('Accept', CRM_APP.accept);
								xhr.setRequestHeader('Authorization', 'Bearer ' + authUser.getToken());
								xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
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
				dtColumns: [
					DTColumnBuilder.newColumn('codigo').withTitle('Código').withOption('sWidth', '10%'),
					DTColumnBuilder.newColumn('producto').withTitle('Producto'),
					DTColumnBuilder.newColumn('precio').withTitle('Precio').renderWith(function (data, type, full) {
						return '$ ' + $filter('number')(full.precio, 2);
					}).withOption('sWidth', '13%'),
					DTColumnBuilder.newColumn(null).notSortable().renderWith(function (data, type, full, meta) {
						var boton = (data.online) ?
						            '<button type="button" class="btn red btn-xs">' +
						            '   <i class="fa fa-toggle-off"></i>' +
						            '</button>' :
						            '<button type="button" class="btn bg-green-jungle bg-font-green-jungle btn-xs">' +
						            '   <i class="fa fa-toggle-on"></i>' +
						            '</button>';
						
						return '<button type="button" class="btn blue-steel btn-xs">' +
							'   <i class="fa fa-plus"></i>' +
							'</button>&nbsp;' +
							'<button type="button" class="btn blue btn-xs">' +
							'   <i class="fa fa-edit"></i>' +
							'</button>&nbsp;' +
							boton;
					}).withOption('sWidth', '17%'),
				],
				reloadTable : function () {
					
				}
			};
			
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
			});
			
			//Nombres
			$rootScope.vista = {
				titulo   : 'Productos',
				subtitulo: 'Gestión de productos y medidas.'
			};
			
			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
		}
	]);
