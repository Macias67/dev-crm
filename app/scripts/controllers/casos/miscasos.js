'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:CasosMiscasosctrlCtrl
 * @description
 * # CasosMiscasosctrlCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('MisCasosCtrl', [
		'$rootScope', '$scope', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'CRM_APP', 'authUser', '$uibModal',
		function ($rootScope, $scope, DTOptionsBuilder, DTColumnBuilder, $compile, CRM_APP, authUser, $uibModal) {
			var vm = this;
			
			vm.tableCasosAsignados = {
				dtInstance: {},
				
				dtOptions: DTOptionsBuilder.fromSource('http://beta.json-generator.com/api/json/get/V1AcSFVc-')
					.withFnServerData(serverData)
					.withLanguageSource('//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json')
					.withDataProp('data')
					.withOption('createdRow', createdRow)
					.withOption('fnRowCallback', rowCallback)
					.withPaginationType('bootstrap_full_number')
					.withBootstrap(),
				
				dtColumns: [
					DTColumnBuilder.newColumn('id').withTitle('ID').withOption('sWidth', '5%'),
					DTColumnBuilder.newColumn('null').withTitle('Cliente').renderWith(function (data, type, full) {
						if (full.cotizacion.cxc) {
							return full.cliente.razonsocial + ' | ' + '<span class="badge badge-danger"> <b>CxC</b> </span>';
						}
						else {
							return full.cliente.razonsocial;
						}
					}).withOption('sWidth', '60%'),
					DTColumnBuilder.newColumn(null).notSortable().renderWith(function (data, type, full, meta) {
						return '<span class="label label-sm label-success ' + data.estatus.class + '"><b>' + data.estatus.estatus + '</b></span>';
					}).withOption('sWidth', '10%'),
					DTColumnBuilder.newColumn(null).notSortable().renderWith(actionsHtml).withOption('sWidth', '30%'),
				]
			};
			
			vm.reloadTable = function () {
				App.blockUI({
					target      : '#tableCasos',
					animate     : true,
					overlayColor: App.getBrandColor('grey')
				});
				vm.tableCasosAsignados.dtInstance.reloadData();
				setTimeout(function () {
					App.unblockUI('#tableCasos');
				}, 1500);
			};
			
			vm.openModalDetalles = function (id) {
				
			};
			
			function serverData(sSource, aoData, fnCallback, oSettings) {
				oSettings.jqXHR = $.ajax({
					'dataType'  : 'json',
					'type'      : 'GET',
					'url'       : 'http://beta.json-generator.com/api/json/get/V1AcSFVc-',
					'data'      : aoData,
					'success'   : fnCallback,
					'beforeSend': function (xhr) {
						xhr.setRequestHeader('Accept', CRM_APP.accept);
						//xhr.setRequestHeader('Authorization', 'Bearer ' + authUser.getToken());
					}
				});
			}
			
			function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
				
			}
			
			function createdRow(row, data, dataIndex) {
				// Recompiling so we can bind Angular directive to the DT
				$compile(angular.element(row).contents())($scope);
			}
			
			function actionsHtml(data, type, full, meta) {
				return '<button ng-click="misCasosCtrl.openModalDetalles(' + data.id + ')" class="btn btn-xs yellow-casablanca" type="button">' +
					'<i class="fa fa-list"></i>&nbsp;Ver detalles' +
					'</button>';
			};
			
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
			});
			
			$scope.$on('reloadTable', function () {
				vm.reloadTable();
			});
			
			//Nombres
			$rootScope.vista = {
				titulo   : 'Mis Casos',
				subtitulo: 'Gestión de mis casos'
			};
			
			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
		}
	]);
