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
				dtInstance        : {},
				dtOptions         : DTOptionsBuilder.fromSource(CRM_APP.url + 'productos')
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
				dtColumns         : [
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
				reloadTable       : function () {
					App.blockUI({
						target      : '#tableProductos',
						animate     : true,
						overlayColor: App.getBrandColor('grey')
					});
					
					vm.tableProductos.dtInstance.reloadData();
					
					setTimeout(function () {
						App.unblockUI('#tableProductos');
					}, 1500);
				},
				modalNuevoProducto: function () {
					App.scrollTop();
					App.blockUI({
						target      : '#ui-view',
						animate     : true,
						overlayColor: App.getBrandColor('blue'),
						zIndex: 9999
					});
					
					$uibModal.open({
						backdrop   : 'static',
						templateUrl: 'ProductoNuevoForm.html',
						controller : 'ModalProductoNuevoCtrl as modalProductoNuevoCtrl',
						resolve : {
							dataUnidades : [
								'Unidades', function (Unidades) {
									return Unidades.get().$promise;
								}
							]
						}
					});
				}
			};
			
			vm.tableUnidades = {
				dtInstance : {},
				dtOptions  : DTOptionsBuilder.fromSource(CRM_APP.url + 'unidades')
					.withFnServerData(function (sSource, aoData, fnCallback, oSettings) {
						oSettings.jqXHR = $.ajax({
							'dataType'  : 'json',
							'type'      : 'GET',
							'url'       : CRM_APP.url + 'unidades',
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
					.withDOM('frtp'),
				dtColumns  : [
					DTColumnBuilder.newColumn('unidad').withTitle('Unidad').withOption('sWidth', '25%'),
					DTColumnBuilder.newColumn('plural').withTitle('Plural').withOption('sWidth', '25%'),
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
					}).withOption('sWidth', '20%'),
				],
				reloadTable: function () {
					App.blockUI({
						target      : '#tableUnidades',
						animate     : true,
						overlayColor: App.getBrandColor('grey')
					});
					
					vm.tableUnidades.dtInstance.reloadData();
					
					setTimeout(function () {
						App.unblockUI('#tableUnidades');
					}, 1500);
				},
				modalNuevaUnidad: function () {
					App.scrollTop();
					App.blockUI({
						target      : '#ui-view',
						animate     : true,
						overlayColor: App.getBrandColor('grey'),
						zIndex: 9999
					});
					
					$uibModal.open({
						backdrop   : 'static',
						templateUrl: 'UnidadNuevaForm.html',
						controller : 'ModalUnidadNuevaCtrl as modalUnidadNuevaCtrl',
						size       : 'sm'
					});
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
	])
	.controller('ModalProductoNuevoCtrl', [
		'$rootScope', '$scope', '$uibModalInstance', '$filter', 'toastr', 'dataUnidades', 'Producto',
		function ($rootScope, $scope, $uibModalInstance, $filter, toastr, dataUnidades, Producto) {
			App.unblockUI('#ui-view');
			
			var vm = this;
			vm.unidades = dataUnidades.data;
			vm.form = {};
			vm.formEdit = false;
			
			
			vm.guarda = function () {
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Guardando prouducto </b>',
					boxed       : true,
					overlayColor: App.getBrandColor('grey'),
					zIndex      : 99999
				});
				
				if (vm.formEdit) {
					Oficina.update({id: dtOficina.data.id}, vm.form, function (response) {
						if (response.hasOwnProperty('errors')) {
							for (var key in response.errors) {
								if (response.errors.hasOwnProperty(key)) {
									toastr.error(response.errors[key][0], 'Error con el formulario.');
								}
							}
						}
						else {
							$uibModalInstance.close();
							$rootScope.$broadcast('reloadTable');
							toastr.success('Se actualizó los datos de la oficina', 'Edición de oficina');
						}
					});
				}
				else {
					console.log(vm.form);
// 					var producto = new Producto(vm.form);
// 					producto.$save(function (response) {
// 						if (response.hasOwnProperty('errors')) {
// 							for (var key in response.errors) {
// 								if (response.errors.hasOwnProperty(key)) {
// 									toastr.error(response.errors[key][0], 'Error con el formulario.');
// 								}
// 							}
// 						}
// 						else {
// 							$uibModalInstance.close();
// 							$rootScope.$broadcast('reloadTable');
// 							toastr.success('Se creó una nueva oficina', 'Nueva oficina');
// 						}
// 					});
				}
				
				setTimeout(function () {
					App.unblockUI('#ui-view');
				}, 1000);
				
			};
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	])
	.controller('ModalUnidadNuevaCtrl', [
		'$rootScope', '$scope', '$uibModalInstance', '$filter', 'toastr', 'Producto',
		function ($rootScope, $scope, $uibModalInstance, $filter, toastr, Producto) {
			var vm = this;
			
			
			App.unblockUI('#tableUnidades');
			
			vm.guarda = function () {
				
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Guardando oficina </b>',
					boxed       : true,
					overlayColor: App.getBrandColor('grey'),
					zIndex      : 99999
				});
				
				if (formEdit) {
					vm.form.telefonos = vm.form.telefonos.toString();
					Oficina.update({id: dtOficina.data.id}, vm.form, function (response) {
						if (response.hasOwnProperty('errors')) {
							for (var key in response.errors) {
								if (response.errors.hasOwnProperty(key)) {
									toastr.error(response.errors[key][0], 'Error con el formulario.');
								}
							}
						}
						else {
							$uibModalInstance.close();
							$rootScope.$broadcast('reloadTable');
							toastr.success('Se actualizó los datos de la oficina', 'Edición de oficina');
						}
					});
				}
				else {
					var oficina = new Oficina(vm.form);
					oficina.$save(function (response) {
						if (response.hasOwnProperty('errors')) {
							for (var key in response.errors) {
								if (response.errors.hasOwnProperty(key)) {
									toastr.error(response.errors[key][0], 'Error con el formulario.');
								}
							}
						}
						else {
							$uibModalInstance.close();
							$rootScope.$broadcast('reloadTable');
							toastr.success('Se creó una nueva oficina', 'Nueva oficina');
						}
					});
				}
				
				setTimeout(function () {
					App.unblockUI('#ui-view');
				}, 1000);
				
			};
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	]);
