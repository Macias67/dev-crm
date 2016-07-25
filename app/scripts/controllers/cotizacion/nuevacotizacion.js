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
		'$rootScope', '$scope', '$http', 'CRM_APP', 'authUser', '$uibModal', '$filter', '$ngBootbox', '$state', 'toastr', 'Cliente', 'Contacto', 'Banco', 'Cotizacion',
		function ($rootScope, $scope, $http, CRM_APP, authUser, $uibModal, $filter, $ngBootbox, $state, toastr, Cliente, Contacto, Banco, Cotizacion) {
			var vm = this;
			
			vm.cotizacion = {
				cliente    : null,
				contacto   : null,
				productos  : [],
				subtotal   : 0,
				totalIVA   : 0,
				total      : 0,
				bancos     : [],
				vencimiento: null,
				cxc        : false,
				enviar     : false
			};
			
			vm.porletProducto    = {
				producto          : null,
				cantidad          : 0,
				subtotal          : 0,
				cDescuento        : 0,
				descuento         : 0,
				total             : 0,
				impuesto          : 16, //%
				iva               : 0,
				porcentaje        : true,
				openModalProductos: function () {
					var modalInstance = $uibModal.open({
						backdrop   : 'static',
						templateUrl: 'modalProductos.html',
						controller : 'ProductosCotizacion as productosCotizacion',
						size       : 'lg'
					});
					modalInstance.result.then(function (selectedProducto) {
						vm.porletProducto.producto   = selectedProducto;
						vm.porletProducto.cantidad   = 1;
						vm.porletProducto.cDescuento = 0;
					}, function () {
					});
				},
				modoDescuento     : function () {
					vm.porletProducto.porcentaje = (!vm.porletProducto.porcentaje);
				},
				agregaProducto    : function () {
					vm.porletProducto.producto.cantidad  = vm.porletProducto.cantidad;
					vm.porletProducto.producto.subtotal  = vm.porletProducto.subtotal;
					vm.porletProducto.producto.descuento = vm.porletProducto.descuento;
					vm.porletProducto.producto.iva       = vm.porletProducto.iva;
					vm.porletProducto.producto.total     = vm.porletProducto.total;
					
					vm.cotizacion.productos.push(vm.porletProducto.producto);
					
					vm.cotizacion.subtotal += vm.porletProducto.producto.subtotal;
					vm.cotizacion.totalIVA += vm.porletProducto.producto.iva;
					vm.cotizacion.total += vm.porletProducto.producto.total;
					
					// Reset
					vm.porletProducto.producto   = null;
					vm.porletProducto.cantidad   = 0;
					vm.porletProducto.subtotal   = 0;
					vm.porletProducto.cDescuento = 0;
					vm.porletProducto.descuento  = 0;
					vm.porletProducto.total      = 0;
					vm.porletProducto.impuesto   = 16;
					vm.porletProducto.iva        = 0;
					vm.porletProducto.porcentaje = true;
				},
				eliminaProducto   : function (index) {
					var producto = vm.cotizacion.productos[index];
					vm.cotizacion.subtotal -= producto.subtotal;
					vm.cotizacion.totalIVA -= producto.iva;
					vm.cotizacion.total -= producto.total;
					vm.cotizacion.productos.splice(index, 1);
				},
				_calculaDescuento : function () {
					if (vm.porletProducto.porcentaje) {
						if (vm.porletProducto.cDescuento > 100) {
							$ngBootbox.alert('<b>Estás calculando porcentaje, el valor máximo debe ser 100%</b>').then(function () {
								vm.porletProducto.cDescuento = 0;
							});
						}
						else {
							vm.porletProducto.descuento = (vm.porletProducto.subtotal * vm.porletProducto.cDescuento) / 100;
							vm.porletProducto.iva       = (((vm.porletProducto.subtotal - vm.porletProducto.descuento) * vm.porletProducto.impuesto) / 100);
							vm.porletProducto.total     = (vm.porletProducto.subtotal - vm.porletProducto.descuento) + vm.porletProducto.iva;
						}
					}
					else {
						if (vm.porletProducto.cDescuento > vm.porletProducto.subtotal) {
							$ngBootbox.alert('<b>No puedes descontar mayor al subtotal estimado, lo máximo es $' + $filter('number')(vm.porletProducto.subtotal, 2) + '</b>').then(function () {
								vm.porletProducto.cDescuento = 0;
							});
						}
						else {
							vm.porletProducto.descuento = vm.porletProducto.cDescuento;
							vm.porletProducto.iva       = (((vm.porletProducto.subtotal - vm.porletProducto.descuento) * vm.porletProducto.impuesto) / 100);
							vm.porletProducto.total     = (vm.porletProducto.subtotal - vm.porletProducto.descuento) + vm.porletProducto.iva;
						}
					}
				}
			};
			vm.porletCliente     = {
				contactos            : [],
				reloadData           : function () {
					Contacto.get({idcliente: vm.cotizacion.cliente.id}, function (contactos) {
						vm.porletCliente.contactos = [];
						contactos.data.forEach(function (item, index) {
							if (item.online) {
								vm.porletCliente.contactos.push(item);
							}
						});
					});
				},
				openModalClientes    : function () {
					var modalInstance = $uibModal.open({
						backdrop   : 'static',
						templateUrl: 'modalClientes.html',
						controller : 'ClientesCotizacion as clientesCotizacion',
						size       : 'lg'
					});
					modalInstance.result.then(function (selectedCliente) {
						vm.cotizacion.cliente      = selectedCliente;
						vm.porletCliente.contactos = [];
						vm.cotizacion.cliente.contactos.forEach(function (item, index) {
							if (item.online) {
								vm.porletCliente.contactos.push(item);
							}
						});
					}, function () {
					});
				},
				openModalNuevoCliente: function (idCliente) {
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
			vm.porletVencimiento = {
				popup          : {
					opened: false
				},
				popupOpen      : function () {
					vm.porletVencimiento.popup.opened = true
				},
				format         : 'dd/MMMM/yyyy',
				altInputFormats: ['M!/d!/yyyy'],
				dateOptions    : {
					formatYear : 'yy',
					maxDate    : new Date(2020, 5, 22),
					minDate    : new Date(),
					startingDay: 1
				}
			};
			vm.porletBancos      = {
				bancos: []
			};
			
			/**
			 * @TODO Hacer peticion mediante $resource
			 */
			vm.porletCxc = {
				password: '',
				verifica: function () {
					if (vm.porletCxc.password == '123456') {
						App.scrollTop();
						$ngBootbox.alert('Haz habilitado esta cotización como <b>Cuenta por Cobrar</b>.').then(function () {
							vm.porletCxc.password = '';
							vm.cotizacion.cxc     = true;
						});
					}
					else {
						$ngBootbox.alert('La contraseña es incorrecta.');
					}
				},
				cancelar: function () {
					$ngBootbox.confirm('¿Seguro de cancelar la cotización como <b>Cuenta por Cobrar</b>? Necesitarás escribir nuevamente la contraseña para rehabilitar.')
						.then(function () {
							vm.cotizacion.cxc = false;
						}, function () {
						});
				}
			};
			vm.porletRevision = {
				cotizacion: null,
				envia     : function () {
					var productos = [];
					vm.cotizacion.productos.forEach(function (item, index) {
						productos[index] = {
							id       : item.id,
							cantidad : item.cantidad,
							precio   : item.precio,
							descuento: item.descuento,
							subtotal : item.subtotal,
							iva      : item.iva,
							total    : item.total
						};
					});
					
					var bancos = [];
					vm.cotizacion.bancos.forEach(function (item, index) {
						bancos.push(item.id);
					});
					
					vm.porletRevision.cotizacion = {
						cliente_id : vm.cotizacion.cliente.id,
						contacto_id: vm.cotizacion.contacto.id,
						productos  : productos,
						bancos     : bancos,
						vencimiento: moment(vm.cotizacion.vencimiento).format("YYYY-MM-DD"),
						cxc        : vm.cotizacion.cxc,
						subtotal   : vm.cotizacion.subtotal,
						iva        : vm.cotizacion.totalIVA,
						total      : vm.cotizacion.total
					};
					
					App.scrollTop();
					App.blockUI({
						target      : '#ui-view',
						message     : '<b> Generando nueva cotización </b>',
						boxed       : true,
						overlayColor: App.getBrandColor('grey'),
						zIndex      : 99999
					});
					
					var cotizacion = new Cotizacion(vm.porletRevision.cotizacion);
					cotizacion.$save(function (response) {
						if (response.hasOwnProperty('errors')) {
							for (var key in response.errors) {
								if (response.errors.hasOwnProperty(key)) {
									toastr.error(response.errors[key][0], 'Hay errores con la cotización.');
								}
							}
							App.unblockUI('#ui-view');
						}
						else {
							resetAll();
							setTimeout(function () {
								App.unblockUI('#ui-view');
								
								$ngBootbox.customDialog({
									message: '¿Deseas hacer una nueva cotización?',
									buttons: {
										success: {
											label    : "Nueva Cotización",
											className: "btn-success",
											callback : function () {
											}
										},
										warning: {
											label    : "Salir",
											className: "btn-default",
											callback : function () {
												$state.go('dashboard');
											}
										},
									}
								});
							}, 1000);
							toastr.success('Se generó nueva cotización', 'Nueva Cotización');
						}
					});
				}
			};
			
			function resetAll() {
				vm.porletProducto.producto   = null;
				vm.porletProducto.cantidad   = 0;
				vm.porletProducto.subtotal   = 0;
				vm.porletProducto.cDescuento = 0;
				vm.porletProducto.descuento  = 0;
				vm.porletProducto.total      = 0;
				vm.porletProducto.impuesto   = 16;
				vm.porletProducto.iva        = 0;
				vm.porletProducto.porcentaje = true;
				
				vm.porletCliente.contactos = [];
				
				vm.cotizacion.cliente     = null;
				vm.cotizacion.contacto    = null;
				vm.cotizacion.productos   = [];
				vm.cotizacion.subtotal    = 0;
				vm.cotizacion.totalIVA    = 0;
				vm.cotizacion.total       = 0;
				vm.cotizacion.bancos      = [];
				vm.cotizacion.vencimiento = null;
				vm.cotizacion.cxc         = false;
				vm.cotizacion.enviar      = false;
				
			}
			
			// Watchers Productos
			$scope.$watch('nuevaCotizacionCtrl.porletProducto.producto.precio', function () {
				var precio                 = (vm.porletProducto.producto == null) ? 0 : vm.porletProducto.producto.precio;
				vm.porletProducto.subtotal = precio * vm.porletProducto.cantidad;
				vm.porletProducto._calculaDescuento();
			});
			$scope.$watch('nuevaCotizacionCtrl.porletProducto.cantidad', function () {
				var precio                 = (vm.porletProducto.producto == null) ? 0 : vm.porletProducto.producto.precio;
				vm.porletProducto.subtotal = precio * vm.porletProducto.cantidad;
				vm.porletProducto._calculaDescuento()
			});
			$scope.$watch('nuevaCotizacionCtrl.porletProducto.cDescuento', function () {
				vm.porletProducto._calculaDescuento();
			});
			$scope.$watch('nuevaCotizacionCtrl.porletProducto.porcentaje', function () {
				vm.porletProducto._calculaDescuento()
			});
			$scope.$watch('nuevaCotizacionCtrl.porletProducto.impuesto', function () {
				vm.porletProducto._calculaDescuento()
			});
			
			//Watchers Cotizacion
			$scope.$watch('nuevaCotizacionCtrl.cotizacion', function () {
				if (vm.cotizacion.cliente != null &&
					vm.cotizacion.contacto != null &&
					vm.cotizacion.productos.length > 0 &&
					vm.cotizacion.bancos.length > 0 &&
					vm.cotizacion.vencimiento != null) {
					vm.cotizacion.enviar = true;
				}
				else {
					vm.cotizacion.enviar = false;
				}
			}, true);
			
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
				Banco.get(function (bancos) {
					vm.porletBancos.bancos = bancos.data;
				});
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
	])
	.controller('ProductosCotizacion', [
		'$rootScope', '$scope', '$uibModalInstance', 'DTOptionsBuilder', 'DTColumnBuilder', 'CRM_APP', '$compile', 'authUser',
		function ($rootScope, $scope, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, CRM_APP, $compile, authUser) {
			var vm        = this;
			vm._productos = [];
			
			vm.tableProductos = {
				dtInstance: {},
				dtOptions : DTOptionsBuilder.fromSource(CRM_APP.url + 'productos')
					.withFnServerData(serverData)
					.withLanguageSource('//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json')
					.withDataProp('data')
					.withOption('createdRow', createdRow)
					.withPaginationType('bootstrap_full_number')
					.withBootstrap(),
				
				dtColumns: [
					DTColumnBuilder.newColumn('codigo').withTitle('Código').withOption('sWidth', '10%'),
					DTColumnBuilder.newColumn('producto').withTitle('Producto'),
					DTColumnBuilder.newColumn('precio').withTitle('Precio').renderWith(function (data, type, full) {
						return '$ ' + full.precio;
					}),
					DTColumnBuilder.newColumn('unidad.unidad').withTitle('Unidad'),
					DTColumnBuilder.newColumn(null).notSortable().renderWith(actionsHtml).withOption('sWidth', '10%'),
				]
			};
			
			function serverData(sSource, aoData, fnCallback, oSettings) {
				oSettings.jqXHR = $.ajax({
					'dataType'  : 'json',
					'type'      : 'GET',
					'url'       : CRM_APP.url + 'productos',
					'success'   : fnCallback,
					'beforeSend': function (xhr) {
						xhr.setRequestHeader('Accept', CRM_APP.accept);
						xhr.setRequestHeader('Authorization', 'Bearer ' + authUser.getToken());
						xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
					}
				});
			}
			
			function actionsHtml(data, type, full, meta) {
				vm._productos[data.id] = data;
				
				return '<button type="button" class="btn btn-xs yellow-casablanca" ng-click="productosCotizacion.selectProducto(' + data.id + ')">' +
					'<i class="fa fa-file-o"></i>&nbsp;Cotizar' +
					'</button>';
			}
			
			function createdRow(row, data, dataIndex) {
				if (data.online) {
					// Recompiling so we can bind Angular directive to the DT
					$compile(angular.element(row).contents())($scope);
				}
			};
			
			/**
			 * @TODO ver la posibilidad de hacer peticion para obtener cliente y no cargar todos en vm._clientes
			 * @param id
			 */
			vm.selectProducto = function (id) {
				$uibModalInstance.close(vm._productos[id]);
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
	])
	.controller('ClientesCotizacion', [
		'$rootScope', '$scope', '$uibModalInstance', 'DTOptionsBuilder', 'DTColumnBuilder', 'CRM_APP', '$compile', 'authUser',
		function ($rootScope, $scope, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, CRM_APP, $compile, authUser) {
			var vm       = this;
			vm._clientes = [];
			
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
			
			/**
			 * @TODO ver la posibilidad de hacer peticion para obtener cliente y no cargar todos en vm._clientes
			 * @param id
			 */
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
