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
		'$rootScope', '$scope', 'Cliente', 'toastr', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'CRM_APP', 'authUser', '$uibModal',
		function ($rootScope, $scope, Cliente, toastr, DTOptionsBuilder, DTColumnBuilder, $compile, CRM_APP, authUser, $uibModal) {
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
					DTColumnBuilder.newColumn('razonsocial').withTitle('Razón Social'),
					DTColumnBuilder.newColumn('rfc').withTitle('R.F.C.'),
					DTColumnBuilder.newColumn(null).withTitle('Tipo').notSortable().renderWith(tipoCliente).withOption('sWidth', '20%'),
					DTColumnBuilder.newColumn(null).notSortable().renderWith(actionsHtml).withOption('sWidth', '14%'),
				]
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
			
			vm.openModalNuevoCliente = function () {
				$uibModal.open({
					backdrop   : 'static',
					templateUrl: 'NuevoCliente.html',
					controller : 'NuevoClienteCtrl as nuevoClienteCtrl',
					size       : 'lg'
				});
			};
			
			vm.openModalInfoCliente = function (id) {
				$uibModal.open({
					backdrop   : 'static',
					templateUrl: 'InfoCliente.html',
					controller : 'InfoClienteCtrl as infoClienteCtrl',
					size       : 'lg',
					resolve    : {
						dtCliente: id
					}
				});
			};
			
			vm.openModalEditaCliente = function (id) {
				$uibModal.open({
					backdrop   : 'static',
					templateUrl: 'EditaCliente.html',
					controller : 'EditaClienteCtrl as editaClienteCtrl',
					size       : 'lg',
					resolve    : {
						dtCliente: id
					}
				});
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
				
			}
			
			function deleteRow(person) {
				
			}
			
			function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
			}
			
			function createdRow(row, data, dataIndex) {
				// Recompiling so we can bind Angular directive to the DT
				$compile(angular.element(row).contents())($scope);
			}
			
			function actionsHtml(data, type, full, meta) {
				return '<button type="button" class="btn blue-steel btn-xs" ng-click = "gestionClientesCtrl.openModalInfoCliente(' + data.id + ')">' +
					'   <i class="fa fa-plus"></i>' +
					'</button>&nbsp;' +
					'<button type="button" class="btn blue btn-xs" ng-click = "gestionClientesCtrl.openModalEditaCliente(' + data.id + ')">' +
					'   <i class="fa fa-edit"></i>' +
					'</button>&nbsp;' +
					'<button type="button" class="btn red btn-xs">' +
					'   <i class="fa fa-trash-o"></i>' +
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
	])
	.controller('NuevoClienteCtrl', [
		'$rootScope', '$scope', '$filter', 'Cliente', 'toastr', '$state',
		function ($rootScope, $scope, $filter, Cliente, toastr, $state) {
			var vm = this;

			vm.formClienteNuevo = {};
			vm.form             = {
				razonsocial  : '',
				rfc          : '',
				prospecto    : false,
				distribuidor: false,
				email        : '',
				calle        : '',
				noexterior   : '',
				nointerior   : '',
				colonia      : '',
				cp           : '',
				ciudad       : '',
				municipio    : '',
				estado       : '',
				pais         : '',
				telefono     : '',
				telefono2    : ''
			};

			vm.guarda = function () {
				App.scrollTop();
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Guardando cliente </b>',
					boxed       : true,
					overlayColor: App.getBrandColor('grey'),
					zIndex      : 99999
				});

				var cliente = new Cliente(vm.form);
				cliente.$save(function (response) {
					if (response.hasOwnProperty('errors')) {
						for (var key in response.errors) {
							if (response.errors.hasOwnProperty(key)) {
								toastr.error(response.errors[key][0], 'Error con el formulario.');
							}
						}
						App.unblockUI('#ui-view');
					}
					else {
						setTimeout(function () {
							App.unblockUI('#ui-view');
						}, 1000);
						toastr.success('Se registró nuevo cliente', 'Nuevo Cliente');
						$state.go('clientes');
					}
				});
			};

			$scope.$watch('nuevoClienteCtrl.form.razonsocial', function () {
				vm.form.razonsocial = $filter('uppercase')(vm.form.razonsocial);
			});
			$scope.$watch('nuevoClienteCtrl.form.rfc', function () {
				vm.form.rfc = $filter('uppercase')(vm.form.rfc);
			});
			$scope.$watch('nuevoClienteCtrl.form.emailempresa', function () {
				vm.form.emailempresa = $filter('lowercase')(vm.form.emailempresa);
			});
			$scope.$watch('nuevoClienteCtrl.form.calle', function () {
				vm.form.calle = $filter('ucfirst')(vm.form.calle);
			});
			$scope.$watch('nuevoClienteCtrl.form.noexterior', function () {
				vm.form.noexterior = $filter('uppercase')(vm.form.noexterior);
			});
			$scope.$watch('nuevoClienteCtrl.form.nointerior', function () {
				vm.form.nointerior = $filter('uppercase')(vm.form.nointerior);
			});
			$scope.$watch('nuevoClienteCtrl.form.colonia', function () {
				vm.form.colonia = $filter('ucfirst')(vm.form.colonia);
			});
			$scope.$watch('nuevoClienteCtrl.form.ciudad', function () {
				vm.form.ciudad = $filter('ucfirst')(vm.form.ciudad);
			});
			$scope.$watch('nuevoClienteCtrl.form.municipio', function () {
				vm.form.municipio = $filter('ucfirst')(vm.form.municipio);
			});
		}
	])
	.controller('InfoClienteCtrl', [
		'$rootScope', '$scope', '$uibModalInstance', 'dtCliente',
		function ($rootScope, $scope, $uibModalInstance, dtCliente) {
			var vm = this;
			
			vm.id = dtCliente;
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	])
	.controller('EditaClienteCtrl', [
		'$rootScope', '$scope', '$uibModalInstance', 'dtCliente',
		function ($rootScope, $scope, $uibModalInstance, dtCliente) {
			var vm = this;
			
			vm.id = dtCliente;
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	]);
