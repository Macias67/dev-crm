'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:ClientesPerfilclientectrlCtrl
 * @description
 * # ClientesPerfilclientectrlCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('PerfilClienteCtrl', [
		'$rootScope', '$scope', 'dataCliente', '$window', '$uibModal', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'CRM_APP', 'authUser',
		function ($rootScope, $scope, dataCliente, $window, $uibModal, DTOptionsBuilder, DTColumnBuilder, $compile, CRM_APP, authUser) {
			var vm     = this;
			vm.cliente = dataCliente.data;

			setTimeout(function () {
				App.unblockUI('#ui-view');
			}, 2000);

			vm.contactos = {
				table             : {
					dtInstance: {},
					dtOptions : DTOptionsBuilder.fromSource(CRM_APP.url + 'clientes/' + vm.cliente.id + '/contactos')
						.withFnServerData(function (sSource, aoData, fnCallback, oSettings) {
							oSettings.jqXHR = $.ajax({
								'dataType'  : 'json',
								'type'      : 'GET',
								'url'       : CRM_APP.url + 'clientes/' + vm.cliente.id + '/contactos',
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
						.withBootstrap()
						.withDisplayLength(5)
						.withDOM('frtip'),
					dtColumns : [
						DTColumnBuilder.newColumn('nombre').withTitle('Nombre').renderWith(function (data, type, full) {
							return full.nombre + ' ' + full.apellido;
						}),
						DTColumnBuilder.newColumn('email').withTitle('Email'),
						DTColumnBuilder.newColumn('telefono').withTitle('Teléfono').withOption('sWidth', '10%'),
						DTColumnBuilder.newColumn(null).withTitle('Activo').renderWith(function (data, type, full, meta) {
							var estatus;
							if (data.online) {
								estatus = '<span class="badge bg-green-jungle bg-font-green-jungle badge-roundless">Activo</span>';
							}
							else {
								estatus = '<span class="badge bg-red-mint bg-font-red-mint badge-roundless"><b>Inactivo</b> </span>';
							}
							return estatus;
						}).withOption('sWidth', '8%'),
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
						}).withOption('sWidth', '14%'),
					]
				},
				reloadTable       : function () {
					App.blockUI({
						target      : '#tableContactos',
						animate     : true,
						overlayColor: App.getBrandColor('grey')
					});
					vm.contactos.table.dtInstance.reloadData();
					setTimeout(function () {
						App.unblockUI('#tableContactos');
					}, 1500);
				},
				modalNuevoContacto: function (idCliente) {
					$uibModal.open({
						backdrop   : 'static',
						templateUrl: 'views/clientes/modal/form_nuevo_contacto.html',
						controller : 'NuevoContactoCtrl as nuevoContactoCtrl',
						resolve    : {
							idCliente: idCliente
						}
					});
				}
			};
			
			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;

			$scope.$on('reloadTable', function () {
				vm.contactos.reloadTable();
			});
			
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
				App.scrollTop();
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Cargando datos del cliente </b>',
					boxed       : true,
					zIndex      : 99999,
					overlayColor: App.getBrandColor('grey')
				});

				dataCliente.$promise.catch(function (err) {
					console.log(err);
				});
			});
		}
	])
	.controller('NuevoContactoCtrl', [
		'$rootScope', '$scope', '$uibModalInstance', 'idCliente', '$filter', 'Contacto', 'toastr',
		function ($rootScope, $scope, $uibModalInstance, idCliente, $filter, Contacto, toastr) {
			var vm               = this;
			vm.formContactoNuevo = {};
			vm.contacto          = {
				nombre  : '',
				apellido: '',
				email   : '',
				telefono: ''
			};
			
			vm.guardar = function () {
				App.scrollTop();
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Guardando cliente </b>',
					boxed       : true,
					overlayColor: App.getBrandColor('grey'),
					zIndex      : 99999
				});
				
				var contacto = new Contacto(vm.contacto);
				contacto.$save({idcliente: idCliente}, function (response) {
					if (response.hasOwnProperty('errors')) {
						for (var key in response.errors) {
							if (response.errors.hasOwnProperty(key)) {
								toastr.error(response.errors[key][0], 'Error con el formulario.');
							}
						}
						App.unblockUI('#ui-view');
					}
					else {
						$uibModalInstance.close();
						setTimeout(function () {
							App.unblockUI('#ui-view');
							$rootScope.$broadcast('reloadTable');
							toastr.success('Se registró a ' + response.data.nombre + ' como nuevo contacto.', 'Nuevo contacto en ' + response.data.cliente.razonsocial);
						}, 1000);
					}
				});
			};
			vm.cancel  = function () {
				$uibModalInstance.dismiss('cancel');
			};
			
			$scope.$watch('nuevoContactoCtrl.contacto.nombre', function () {
				vm.contacto.nombre = $filter('ucfirst')(vm.contacto.nombre);
			});
			$scope.$watch('nuevoContactoCtrl.contacto.apellido', function () {
				vm.contacto.apellido = $filter('ucfirst')(vm.contacto.apellido);
			});
			$scope.$watch('nuevoContactoCtrl.contacto.email', function () {
				vm.contacto.email = $filter('lowercase')(vm.contacto.email);
			});
		}
	]);
