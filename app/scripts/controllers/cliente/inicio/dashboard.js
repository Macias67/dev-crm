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
				dtOptions : DTOptionsBuilder.fromSource(CRM_APP.url + 'cotizaciones?estatus=2&cliente=1')
					.withFnServerData(function (sSource, aoData, fnCallback, oSettings) {
						oSettings.jqXHR = $.ajax({
							'dataType'  : 'json',
							'type'      : 'GET',
							'url'       : CRM_APP.url + 'cotizaciones?estatus=2&cliente=1',
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
		'$scope', '$rootScope', '$uibModalInstance', 'dtCotizacion', '$filter', function ($scope, $rootScope, $uibModalInstance, dtCotizacion, $filter) {
			var vm        = this;
			vm.cotizacion = dtCotizacion;
			vm.uploading  = false;
			vm.progress   = 0;
			
			vm.formArchivos = {
				archivo    : null,
				comentarios: ''
			};
			
			vm.uploadFiles = function () {
				console.log(vm.formArchivos);
				
				var metadata = {
					customMetadata: {
						'cotizacion_id': vm.cotizacion.id
					}
				};
				
				var storageRef = firebase.storage().ref('comprobantes');
				var uploadTask = storageRef.child(vm.formArchivos.archivo.name).put(vm.formArchivos.archivo, metadata);
				vm.uploading   = true;
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
				}, function () {
					// Handle successful uploads on complete
					// For instance, get the download URL: https://firebasestorage.googleapis.com/...
					var downloadURL = uploadTask.snapshot.downloadURL;
					console.log(downloadURL);
					$scope.$apply(function () {
						vm.uploading = false;
					});
				});
			};
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	]);
