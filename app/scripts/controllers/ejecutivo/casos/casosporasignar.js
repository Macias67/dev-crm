'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:CasosCasosporasignarctrlCtrl
 * @description
 * # CasosCasosporasignarctrlCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('CasosPorAsignarCtrl', [
		'$rootScope',
		'$scope',
		'Cotizacion',
		'Caso',
		'Ejecutivo',
		'toastr',
		'DTOptionsBuilder',
		'DTColumnBuilder',
		'$compile',
		'CRM_APP',
		'authUser',
		'$uibModal',
		'$filter',
		function ($rootScope, $scope, Cotizacion, Caso, Ejecutivo, toastr, DTOptionsBuilder, DTColumnBuilder, $compile, CRM_APP, authUser, $uibModal, $filter) {
			var vm = this;
			
			vm.tableCasos = {
				message   : '',
				dtInstance: {},
				
				dtOptions: DTOptionsBuilder.fromSource(CRM_APP.url + 'casos?asignado=false')
					.withFnServerData(serverData)
					.withLanguageSource('//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json')
					.withDataProp('data')
					.withOption('createdRow', createdRow)
					.withOption('fnRowCallback', rowCallback)
					.withPaginationType('bootstrap_full_number')
					.withBootstrap(),
				
				dtColumns: [
					DTColumnBuilder.newColumn('id').withTitle('ID').withOption('sWidth', '5%'), ,
					DTColumnBuilder.newColumn('null').withTitle('Cliente').renderWith(function (data, type, full) {
						if (full.cotizacion.cxc) {
							return full.cliente.razonsocial + ' | ' + '<span class="badge badge-danger"> <b>CxC</b> </span>';
						}
						else {
							return full.cliente.razonsocial;
						}
					}).withOption('sWidth', '40%'),
					DTColumnBuilder.newColumn('null').withTitle('Se validó').renderWith(function (data, type, full) {
						return '<span am-time-ago="' +full.cotizacion.validacion + ' | amFromUnix "></span>';
					}),
					DTColumnBuilder.newColumn(null).notSortable().renderWith(actionsHtml).withOption('sWidth', '30%'),
				]
			};
			
			vm.reloadTable = function () {
				
				App.blockUI({
					target      : '#tableCasos',
					animate     : true,
					overlayColor: App.getBrandColor('grey')
				});
				
				vm.tableCasos.dtInstance.reloadData();
				
				setTimeout(function () {
					App.unblockUI('#tableCasos');
				}, 1500);
			};
			
			vm.openModalCotizacion = function (id) {
				App.scrollTop();
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Mostrando detalles de la cotización </b>',
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
			
			vm.openModalAsignacion = function (id) {
				App.scrollTop();
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Mostrando detalles del caso </b>',
					boxed       : true,
					overlayColor: App.getBrandColor('grey'),
					zIndex      : 99999
				});
				
				var caso = Caso.query({id: id}, function () {
					var ejecutivos = Ejecutivo.get({online: 'true'}, function () {
						App.unblockUI('#ui-view');
						$uibModal.open({
							backdrop   : 'static',
							templateUrl: 'modalAsigna.html',
							controller : 'ModalAsignaCtrl as modalAsignaCtrl',
							size       : 'lg',
							resolve    : {
								dtCaso     : caso.data,
								dtEjecutivo: ejecutivos
							}
						});
					});
				});
			};
			
			function serverData(sSource, aoData, fnCallback, oSettings) {
				oSettings.jqXHR = $.ajax({
					'dataType'  : 'json',
					'type'      : 'GET',
					'url'       : CRM_APP.url + 'casos?asignado=false',
					'data'      : aoData,
					'success'   : fnCallback,
					'beforeSend': function (xhr) {
						xhr.setRequestHeader('Accept', CRM_APP.accept);
						xhr.setRequestHeader('Authorization', 'Bearer ' + authUser.getToken());
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
				return '<button ng-click="casosPorAsignarCtrl.openModalCotizacion(' + data.id + ')" class="btn btn-xs yellow-casablanca" type="button">' +
					'<i class="fa fa-list"></i>&nbsp;Ver cotización' +
					'</button>&nbsp;' +
					'<button ng-click="casosPorAsignarCtrl.openModalAsignacion(' + data.id + ')" class="btn btn-xs green-turquoise" type="button">' +
					'<i class="fa fa-black-tie"></i>&nbsp;Asignar caso' +
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
				titulo   : 'Casos por asignar',
				subtitulo: 'Casos es espera de asignación de líder'
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
					}
				});
			};
			
			vm.indicaIrregular = function (idPago) {
				
			};
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	])
	.controller('ModalAsignaCtrl', [
		'$rootScope',
		'$scope',
		'$uibModalInstance',
		'dtEjecutivo',
		'dtCaso',
		'$ngBootbox',
		'toastr',
		'Lider',
		function ($rootScope, $scope, $uibModalInstance, dtEjecutivo, dtCaso, $ngBootbox, toastr, Lider) {
			var vm        = this;
			vm.caso       = dtCaso;
			vm.ejecutivos = [];
			
			dtEjecutivo.data.forEach(function (item, index) {
				if (item.online) {
					vm.ejecutivos.push(item);
				}
			});
			
			vm.ejecutivoSelected = vm.ejecutivos[0];
			
			vm.asignaCaso = function () {
				$ngBootbox.confirm('¿Seguro de asignar el caso a <b>' + vm.ejecutivoSelected.nombre + ' ' + vm.ejecutivoSelected.apellido + '</b>?')
					.then(function () {
						App.scrollTop();
						App.blockUI({
							target      : '#ui-view',
							message     : '<b> Asignando líder... </b>',
							boxed       : true,
							overlayColor: App.getBrandColor('grey'),
							zIndex      : 99999
						});
						
						var lider = new Lider({lider: vm.ejecutivoSelected.id});
						lider.$save({idCaso: vm.caso.id}).then(function (response) {
							App.unblockUI('#ui-view');
							if (response.hasOwnProperty('errors')) {
								for (var key in response.errors) {
									if (response.errors.hasOwnProperty(key)) {
										toastr.error(response.errors[key][0], 'Hay errores con la asignación.');
									}
								}
							}
							else {
								setTimeout(function () {
									$uibModalInstance.dismiss('cancel');
									toastr.success('Se le ha notificado a ' + response.data.nombre + ' que es líder del caso #' + vm.caso.id, response.data.nombre + ' es líder del caso.');
									$rootScope.$broadcast('reloadTable');
								}, 1000);
							}
						}, function (response) {
							console.log(response);
						});
					});
			};
			
			vm.cierraCaso = function () {
				$ngBootbox.confirm('¿Seguro que quieres cerrar el caso?')
					.then(function () {
						console.log('Confirmed!');
					}, function () {
						console.log('Confirm dismissed!');
					});
			};
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	]);
