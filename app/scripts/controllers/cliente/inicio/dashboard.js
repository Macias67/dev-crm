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
		'$scope', '$rootScope', 'CRM_APP', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'authUser', '$uibModal', 'Cotizacion',
		function ($scope, $rootScope, CRM_APP, DTOptionsBuilder, DTColumnBuilder, $compile, authUser, $uibModal, Cotizacion) {
			var vm = this;
			
			vm.tableCotizaciones = {
				dtInstance: {},
				dtOptions : DTOptionsBuilder.fromSource(CRM_APP.url + 'cotizaciones')
					.withFnServerData(function (sSource, aoData, fnCallback, oSettings) {
						oSettings.jqXHR = $.ajax({
							'dataType'  : 'json',
							'type'      : 'GET',
							'url'       : CRM_APP.url + 'cotizaciones?estatus=1&cliente=1',
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
					//.withOption('aaSorting', [3, 'asc'])
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
						return '<span am-time-ago="' + full.fecha + '  | amFromUnix"></span>';
					}),
					DTColumnBuilder.newColumn('null').withTitle('Vencimiento').renderWith(function (data, type, full) {
						return '<span am-time-ago="' + full.vencimiento + ' | amFromUnix" class="bold"></span>';
					}),
					DTColumnBuilder.newColumn('null').withTitle('Estatus').renderWith(function (data, type, full) {
						return '<span class="badge bold bg-' + full.estatus.class + ' bg-font-' + full.estatus.class + '"> ' + full.estatus.estatus + ' </span>';
					}),
					DTColumnBuilder.newColumn(null).notSortable().renderWith(function (data, type, full, meta) {
						return '<button ng-click="dashboardCtrl.tableCotizaciones.openModalInfoPago(' + data.id + ')" class="btn btn-xs yellow-casablanca" type="button">' +
							'<i class="fa fa-search"></i>&nbsp;Revisar' +
							'</button>';
					}).withOption('sWidth', '14%')
				],
				reloadTable      : function () {
					App.blockUI({
						target      : '#tableCotizaciones',
						animate     : true,
						overlayColor: App.getBrandColor('grey')
					});
					vm.tableCotizaciones.dtInstance.reloadData();
					setTimeout(function () {
						App.unblockUI('#tableCotizaciones');
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
							templateUrl: 'views/vista-cliente/inicio/modal/vista_cotizacion.html',
							controller : 'RevisaCotizacionCtrl as revisaCotizacionCtrl',
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
			
			$scope.$on('reloadTable', function () {
				vm.tableCotizaciones.reloadTable();
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
	.controller('RevisaCotizacionCtrl', [
		'$scope',
		'$rootScope',
		'$uibModalInstance',
		'dtCotizacion',
		'$filter',
		'Pago',
		'authUser',
		'NotifService',
		function ($scope, $rootScope, $uibModalInstance, dtCotizacion, $filter, Pago, authUser, NotifService) {
			var vm        = this;
			vm.cotizacion = dtCotizacion;
			vm.uploading  = false;
			vm.progress   = 0;
			
			vm.formArchivos = {
				archivo    : null,
				pago       : '',
				cantidad   : 0,
				comentarios: ''
			};
			
			vm.total = function () {
				if (vm.formArchivos.pago == 'total') {
					vm.formArchivos.cantidad = vm.cotizacion.total;
				}
			};
			
			vm.uploadFiles = function () {
				var metadata = {
					customMetadata: {
						'cotizacion_id': vm.cotizacion.id
					}
				};
				
				var storageRef = firebase.storage().ref('comprobantes/' + vm.cotizacion.id);
				var uploadTask = storageRef.child(vm.formArchivos.archivo.name).put(vm.formArchivos.archivo, metadata);
				vm.uploading   = true;
				App.blockUI({
					target : '#subeform',
					animate: true,
					zIndex : 99999
				});
				uploadTask.on('state_changed', function (snapshot) {
					// Observe state change events such as progress, pause, and resume
					// See below for more detail
					var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					$scope.$apply(function () {
						vm.progress = $filter('number')(progress, 0);
					});
				}, function (error) {
					// Handle unsuccessful uploads
					$scope.$apply(function () {
						vm.uploading = false;
					});
					console.log(error);
				}, function () {
					// Handle successful uploads on complete
					// For instance, get the download URL: https://firebasestorage.googleapis.com/...
					
					var pagoData = {
						cotizacion_id: vm.cotizacion.id,
						contacto_id  : authUser.getSessionData().id,
						cantidad     : vm.formArchivos.cantidad,
						tipo         : vm.formArchivos.pago,
						comentario   : vm.formArchivos.comentarios,
						archivo      : {
							url        : uploadTask.snapshot.downloadURL,
							contentType: uploadTask.snapshot.metadata.contentType,
							fullPath   : uploadTask.snapshot.metadata.fullPath,
							hash       : uploadTask.snapshot.metadata.md5Hash,
							name       : uploadTask.snapshot.metadata.name,
							size       : uploadTask.snapshot.metadata.size
						}
					};
					var pago     = new Pago(pagoData);
					pago.$save({idCotizacion: vm.cotizacion.id}).then(function (response) {
						if (response.hasOwnProperty('errors')) {
							for (var key in response.errors) {
								if (response.errors.hasOwnProperty(key)) {
									NotifService.error(response.errors[key][0], 'Error con el formulario.');
								}
							}
							App.unblockUI('#subeform');
						}
						else {
							if (response.$resolved) {
								$uibModalInstance.close();
								setTimeout(function () {
									App.unblockUI('#subeform');
									$scope.$apply(function () {
										vm.uploading = false;
									});
									$rootScope.$broadcast('reloadTable');
									NotifService.success('El pago se ha subido con éxito para su verficación.', 'Pago subido con éxito');
								}, 1000);
							}
							else {
								console.log(response);
								console.log(response.data);
								console.log(response.status);
								console.log(response.headers);
								console.log(response.config);
								console.log(response.statusText);
							}
						}
					}, function (response) {
						App.unblockUI('#subeform');
						// Create a reference to the file to delete
						var desertRef = storageRef.child(uploadTask.snapshot.metadata.name);
						// Delete the file
						desertRef.delete().then(function () {
							// File deleted successfully
						}).catch(function (error) {
							// Uh-oh, an error occurred!
						});
						
						$uibModalInstance.close();
						NotifService.error(response.data.message, 'ERROR ' + response.status);
						console.error(response.data.message, response.statusText, response.status);
					});
				});
			};
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	]);
