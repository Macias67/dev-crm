'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:CotizacionRevisionpagosctrlCtrl
 * @description
 * # CotizacionRevisionpagosctrlCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('RevisionPagosCtrl', [
		'$rootScope', '$scope', 'Cotizacion', 'toastr', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'CRM_APP', 'authUser', '$uibModal', '$filter',
		function ($rootScope, $scope, Cotizacion, toastr, DTOptionsBuilder, DTColumnBuilder, $compile, CRM_APP, authUser, $uibModal, $filter) {
			var vm = this;
			
			vm.tablePagos = {
				message   : '',
				dtInstance: {},
				
				dtOptions: DTOptionsBuilder.fromSource(CRM_APP.url + 'cotizaciones?estatus=2')
					.withFnServerData(serverData)
					.withLanguageSource('//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json')
					.withDataProp('data')
					.withOption('createdRow', createdRow)
					.withOption('fnRowCallback', rowCallback)
					.withPaginationType('bootstrap_full_number')
					.withBootstrap(),
				
				dtColumns: [
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
					DTColumnBuilder.newColumn('null').withTitle('Se comprobó').renderWith(function (data, type, full) {
						return '<span am-time-ago="' + moment(full.pagos[0].fecha) + ' "></span>';
					}),
					DTColumnBuilder.newColumn(null).withTitle('Total archivos').renderWith(totalArchivos).withOption('sWidth', '20%'),
					DTColumnBuilder.newColumn(null).notSortable().renderWith(actionsHtml).withOption('sWidth', '14%'),
				]
			};
			
			vm.reloadTable = function () {
				
				App.blockUI({
					target      : '#tablePagos',
					animate     : true,
					overlayColor: App.getBrandColor('grey')
				});
				
				vm.tablePagos.dtInstance.reloadData();
				
				setTimeout(function () {
					App.unblockUI('#tablePagos');
				}, 1500);
			};
			
			vm.openModalInfoPago = function (id) {
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
			};
			
			function serverData(sSource, aoData, fnCallback, oSettings) {
				oSettings.jqXHR = $.ajax({
					'dataType'  : 'json',
					'type'      : 'GET',
					'url'       : CRM_APP.url + 'cotizaciones?estatus=2',
					'data'      : aoData,
					'success'   : fnCallback,
					'beforeSend': function (xhr) {
						xhr.setRequestHeader('Accept', CRM_APP.accept);
						xhr.setRequestHeader('Authorization', 'Bearer ' + authUser.getToken());
						//xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
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
				return '<button ng-click="revisionPagosCtrl.openModalInfoPago(' + data.id + ')" class="btn btn-xs yellow-casablanca" type="button">' +
					'<i class="fa fa-check"></i>&nbsp;Revisar' +
					'</button>';
			};
			
			function totalArchivos(data, type, full, meta) {
				var total = 0;
				data.pagos.forEach(function (item, index) {
					if (!item.valido) {
						total += item.comprobantes.length;
					}
				});
				
				return total;
			};
			
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
			});
			
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
			});
			
			$scope.$on('reloadTable', function () {
				vm.reloadTable();
			});
			
			//Nombres
			$rootScope.vista = {
				titulo   : 'Pagos por revisar',
				subtitulo: 'Cotizaciones pagadas'
			};
			
			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
		}
	])
	.controller('ModalRevisaCtrl', [
		'$rootScope',
		'$scope',
		'$uibModalInstance',
		'DTOptionsBuilder',
		'DTColumnBuilder',
		'CRM_APP',
		'$compile',
		'authUser',
		'dtCotizacion',
		'$ngBootbox',
		'Pago',
		'toastr',
		function ($rootScope, $scope, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, CRM_APP, $compile, authUser, dtCotizacion, $ngBootbox, Pago, toastr) {
			var vm = this;
			
			vm.cotizacion = dtCotizacion;
			
			vm.indicaPagada = function (idPago) {
				//console.log(vm.cotizacion);
				App.scrollTop();
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Generando nuevo Caso </b>',
					boxed       : true,
					overlayColor: App.getBrandColor('grey'),
					zIndex      : 99999
				});
				
				Pago.valida({idCotizacion: vm.cotizacion.id, id: idPago}, {valido: true}, function (response) {
					if (response.hasOwnProperty('errors')) {
						for (var key in response.errors) {
							if (response.errors.hasOwnProperty(key)) {
								toastr.error(response.errors[key][0], 'Hay errores con la cotización.');
							}
						}
						App.unblockUI('#ui-view');
					}
					else {
						setTimeout(function () {
							$uibModalInstance.dismiss('cancel');
							App.unblockUI('#ui-view');
							toastr.success('Se generó nuevo caso en espera de asignar líder.', 'Nuevo caso sin líder');
							$rootScope.$broadcast('reloadTable');
						}, 1000);
						
						console.log(response);
					}
				});
			};
			
			vm.indicaIrregular = function (idPago) {
				
			};
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	]);
