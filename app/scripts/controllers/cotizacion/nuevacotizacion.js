'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:CotizacionNuevacotizacionctrlCtrl
 * @description
 * # CotizacionNuevacotizacionctrlCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('NuevaCotizacionCtrl', [
		'$rootScope', '$scope', '$http', 'CRM_APP', 'authUser', '$uibModal', 'Cliente',
		function ($rootScope, $scope, $http, CRM_APP, authUser, $uibModal, Cliente) {
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
			});
			
			var vm     = this;
			vm.cliente = {};

			vm.openModalClientes = function () {

				var modalInstance = $uibModal.open({
					backdrop   : 'static',
					templateUrl: 'modalClientes.html',
					controller : 'ClientesCotizacion as clientesCotizacion',
					size       : 'lg'
				});

				modalInstance.result.then(function (selectedCliente) {
					vm.cliente = selectedCliente;
					console.log(vm.cliente);
				}, function () {});
			};
			
			// Any function returning a promise object can be used to load values asynchronously
			$scope.getLocation = function (val) {
				return $http.get(CRM_APP.url + 'clientes', {
					headers: {
						'Authorization': 'Bearer ' + authUser.getToken()
					},
					params : {
						q: val
					}
				}).then(function (response) {
					return response.data.data.map(function (item) {
						return item.rfc + ' | ' + item.razonsocial;
					});
				});
			};
			
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
	])
	.controller('ClientesCotizacion', [
		'$rootScope', '$scope', '$uibModalInstance', 'DTOptionsBuilder', 'DTColumnBuilder', 'CRM_APP', '$compile', 'authUser',
		function ($rootScope, $scope, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, CRM_APP, $compile, authUser) {
			var vm       = this;
			vm._clientes = {};
			
			vm.tableClientes = {
				dtInstance: {},
				dtOptions : DTOptionsBuilder.fromSource(CRM_APP.url + 'clientes')
					.withFnServerData(serverData)
					.withLanguageSource('//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json')
					.withDataProp('data')
					.withOption('createdRow', createdRow)
					.withPaginationType('bootstrap_full_number')
					.withBootstrap(),
				
				dtColumns: [
					DTColumnBuilder.newColumn('id').withTitle('ID').withOption('sWidth', '10%'),
					DTColumnBuilder.newColumn('razonsocial').withTitle('Razón Social'),
					DTColumnBuilder.newColumn('rfc').withTitle('R.F.C.'),
					DTColumnBuilder.newColumn(null).withTitle('Tipo').notSortable().renderWith(tipoCliente).withOption('sWidth', '20%'),
					DTColumnBuilder.newColumn(null).notSortable().renderWith(actionsHtml).withOption('sWidth', '10%'),
				]
			};

			function serverData(sSource, aoData, fnCallback, oSettings) {
				oSettings.jqXHR = $.ajax({
					'dataType'  : 'json',
					'type'      : 'GET',
					'url'       : CRM_APP.url + 'clientes',
					'success'   : fnCallback,
					'beforeSend': function (xhr) {
						xhr.setRequestHeader('Accept', CRM_APP.accept);
						xhr.setRequestHeader('Authorization', 'Bearer ' + authUser.getToken());
						xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
					}
				});
			}

			function actionsHtml(data, type, full, meta) {
				vm._clientes[data.id] = data;

				return '<button type="button" class="btn btn-xs yellow-casablanca" ng-click="clientesCotizacion.selectCliente(' + data.id + ')">' +
					'<i class="fa fa-file-o"></i>&nbsp;Cotizar' +
					'</button>';
			}
			
			function tipoCliente(data, type, full, meta) {
				var prospecto, distribuidor;
				if (data.prospecto) {
					prospecto = '<span class="badge bg-red-mint bg-font-red-mint badge-roundless"><b>Prospecto</b> </span>&nbsp;';
				}
				else {
					prospecto = '<span class="badge badge-primary badge-roundless">Normal</span>&nbsp;';
				}
				
				if (data.distribuidor) {
					distribuidor = '<span class="badge bg-yellow-casablanca bg-font-yellow-casablanca badge-roundless"><b>Distribuidor</b> </span>';
				}
				else {
					distribuidor = '<span class="badge badge-primary badge-roundless">Normal</span>';
				}
				return prospecto + distribuidor;
			};

			function createdRow(row, data, dataIndex) {
				// Recompiling so we can bind Angular directive to the DT
				$compile(angular.element(row).contents())($scope);
			};

			vm.selectCliente = function (id) {
				$uibModalInstance.close(vm._clientes[id]);
			};
			
			vm.reloadTable = function () {
				
				App.blockUI({
					target      : '#tableClientes',
					animate     : true,
					overlayColor: App.getBrandColor('grey')
				});
				
				vm.tableClientes.dtInstance.reloadData();
				
				setTimeout(function () {
					App.unblockUI('#tableClientes');
				}, 1500);
			};
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	]);
