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
				dtInstance: {},
				dtOptions : DTOptionsBuilder.fromSource(CRM_APP.url + 'cotizaciones?estatus=2')
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
						return '<span am-time-ago="' + full.fecha + '  | amFromUnix"></span>';
					}),
					DTColumnBuilder.newColumn('null').withTitle('Se comprobó').renderWith(function (data, type, full) {
						return '<span am-time-ago="' + full.pagos[0].fecha + '  | amFromUnix"></span>';
					}),
					DTColumnBuilder.newColumn('null').withTitle('Estatus').renderWith(function (data, type, full) {
						return '<span class="badge bold bg-' + full.estatus.class + ' bg-font-' + full.estatus.class + '"> ' + full.estatus.estatus + ' </span>';
					}).withOption('sWidth', '20%'),
					DTColumnBuilder.newColumn(null).notSortable().renderWith(actionsHtml).withOption('sWidth', '14%'),
				]
			};
			
			vm.tablePagosAbonados = {
				dtInstance: {},
				dtOptions : DTOptionsBuilder.fromSource(CRM_APP.url + 'cotizaciones?estatus=5')
					.withFnServerData(function (sSource, aoData, fnCallback, oSettings) {
						oSettings.jqXHR = $.ajax({
							'dataType'  : 'json',
							'type'      : 'GET',
							'url'       : CRM_APP.url + 'cotizaciones?estatus=5',
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
						return '<span am-time-ago="' + full.fecha + '  | amFromUnix"></span>';
					}),
					DTColumnBuilder.newColumn('null').withTitle('Se comprobó').renderWith(function (data, type, full) {
						return '<span am-time-ago="' + full.pagos[0].fecha + '  | amFromUnix"></span>';
					}),
					DTColumnBuilder.newColumn('null').withTitle('Estatus').renderWith(function (data, type, full) {
						return '<span class="badge bold bg-' + full.estatus.class + ' bg-font-' + full.estatus.class + '"> ' + full.estatus.estatus + ' </span>';
					}).withOption('sWidth', '20%'),
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
				
				$uibModal.open({
					backdrop   : 'static',
					templateUrl: 'views/vista-ejecutivo/cotizaciones/modal/modalRevision.html',
					controller : 'ModalRevisaCtrl as modalRevisaCtrl',
					size       : 'lg',
					resolve    : {
						dtCotizacion: Cotizacion.get({id: id}).$promise
					}
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
		'NotifService',
		'$timeout',
		'ngAudio',
		'Cotizacion',
		function ($rootScope, $scope, $uibModalInstance, DTOptionsBuilder, DTColumnBuilder, CRM_APP, $compile, authUser, dtCotizacion, $ngBootbox, Pago, NotifService, $timeout, ngAudio, Cotizacion) {
			var vm = this;
			var cont, form, input, getLastPostPos;
			if (dtCotizacion.$resolved) {
				App.unblockUI('#ui-view');
				vm.cotizacion = dtCotizacion.data;
			}
			
			vm.pagosValidos = function () {
				var total = 0;
				vm.cotizacion.pagos.forEach(function (pago, index) {
					if (pago.revisado) {
						if (pago.valido) {
							total++;
						}
					}
				});
				
				return total;
			};
			
			$uibModalInstance.rendered.then(function () {
				angular.element('.modal-dialog').css({width: '70%'});
				App.initAjax();
				
				cont             = $('#chats');
				form             = $('.chat-form', cont);
				input            = $('input', form);
				vm.usuarioActual = authUser.getSessionData();
				getLastPostPos   = function () {
					var height = 0;
					cont.find("li.out, li.in").each(function () {
						height = height + $(this).outerHeight();
					});
					return height;
				};
				
				input.keypress(function (e) {
					if (e.which == 13) {
						vm.chat.enviar();
						return false; //<---- Add this line
					}
				});
				
				vm.mensajesChat = [];
				firebase.database().ref('cotizacion/' + vm.cotizacion.id + '/chat').on('value', function (snapshot) {
					$timeout(function () {
						vm.mensajesChat = snapshot.val();
					});
					
					setTimeout(function () {
						ngAudio.setUnlock(false);
						ngAudio.load('sounds/duo.mp3').play();
						cont.find('.scroller').slimScroll({
							scrollTo: getLastPostPos()
						});
					});
				});
				
				setTimeout(function () {
					cont.find('.scroller').slimScroll({
						scrollTo: getLastPostPos()
					});
				}, 2000);
			});
			
			vm.indicaPagada = function (idPago, index) {
				$ngBootbox.confirm('<h3>¿Estás seguro de validar este pago como pagada?</h3>').then(function () {
					App.scrollTop();
					App.blockUI({
						target      : '#revisaModel',
						message     : '<b> Validando pago </b>',
						boxed       : true,
						overlayColor: App.getBrandColor('grey'),
						zIndex      : 99999
					});
					
					var pago = new Pago({valido: true});
					pago.$valida({idCotizacion: vm.cotizacion.id, id: idPago}).then(function (response) {
						vm.reloadCotizacion();
						// Si no tiene data es porque solo valido pago y NO creo caso
						if (!response.hasOwnProperty('data')) {
							vm.cotizacion.pagos[index].revisado = true;
							App.unblockUI('#revisaModel');
							App.scrollTop();
							NotifService.info('Se ha validado correctamente el pago.', 'Pago validado con éxito.');
							$rootScope.$broadcast('reloadTable');
						}
						else {
							// Se creo el caso
							App.unblockUI('#revisaModel');
							App.scrollTop();
							$rootScope.$broadcast('reloadTable');
							
							var msj = '';
							// Abonada
							if (response.data.cotizacion.estatus.id == 5) {
								msj = 'La cotización se encuentra <b>abonada</b> y se ha abierto el caso en espera de líder.'
							}
							else if (response.data.cotizacion.estatus.id == 4) {
								// Pagada
								msj = 'La cotización se encuentra <b>pagada</b> y se ha abierto el caso en espera de líder.'
							}
							NotifService.success(msj, 'Pago validado con éxito.');
						}
					}, function (response) {
						if (response.data.hasOwnProperty('errors')) {
							for (var key in response.data.errors) {
								if (response.data.errors.hasOwnProperty(key)) {
									NotifService.error(response.data.errors[key][0], 'Hay errores con los datos.');
								}
							}
							App.unblockUI('#revisaModel');
							return;
						}
						App.unblockUI('#revisaModel');
						NotifService.error(response.data.message, 'ERROR ' + response.status);
					});
				});
			};
			
			vm.indicaIrregular = function (idPago, index) {
				$ngBootbox.confirm('<h3>¿Estás seguro de validar este pago como irregular? Al hacerlo puedes mandarle un mensaje directo al cliente para darle a conocer que sucedió con el pago.</h3>').then(function () {
					App.scrollTop();
					App.blockUI({
						target      : '#revisaModel',
						message     : '<b> Validando pago </b>',
						boxed       : true,
						overlayColor: App.getBrandColor('grey'),
						zIndex      : 99999
					});
					
					Pago.valida({idCotizacion: vm.cotizacion.id, id: idPago}, {valido: false}).$promise.then(function (response) {
						if (response.$resolved) {
							App.scrollTop();
							App.unblockUI('#revisaModel');
							vm.cotizacion.pagos[index].revisado = true;
							NotifService.info('Se ha marcado como pago irregular.', 'Pago validado como irregular.');
							$rootScope.$broadcast('reloadTable');
						}
					}, function (response) {
						if (response.data.hasOwnProperty('errors')) {
							for (var key in response.data.errors) {
								if (response.data.errors.hasOwnProperty(key)) {
									NotifService.error(response.data.errors[key][0], 'Hay errores con los datos.');
								}
							}
							App.unblockUI('#revisaModel');
							return;
						}
						App.unblockUI('#revisaModel');
						NotifService.error(response.data.message, 'ERROR ' + response.status);
					});
				});
			};
			
			vm.reloadCotizacion = function () {
				App.scrollTop();
				App.blockUI({
					target      : '#revisaModel',
					message     : '<b> Actuliando cotización </b>',
					boxed       : true,
					overlayColor: App.getBrandColor('grey'),
					zIndex      : 99999
				});
				
				Cotizacion.get({id: vm.cotizacion.id}).$promise.then(function (response) {
					if (response.$resolved) {
						vm.cotizacion = response.data;
						vm.reloadPagos();
						App.unblockUI('#revisaModel');
					}
				}, function (response) {
					NotifService.error(response.data.message, response.statusText + ' (' + response.status + ')');
					App.unblockUI('#revisaModel');
				});
			};
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
			
			vm.chat = {
				enviar: function () {
					var inputText = angular.element('#mensaje');
					var mensaje   = inputText.val();
					if (mensaje.length == 0) {
						return;
					}
					firebase.database().ref('cotizacion/' + vm.cotizacion.id + '/chat').push({
						usuario  : {
							id    : vm.usuarioActual.id,
							nombre: vm.usuarioActual.nombre + ' ' + vm.usuarioActual.apellido,
							color : vm.usuarioActual.ejecutivo.color,
							class : vm.usuarioActual.ejecutivo.class,
							rol   : 'Ejecutivo'
						},
						visto    : [],
						mensaje  : mensaje,
						timestamp: moment().unix()
					}).then(function (response) {
						inputText.val('');
					}, function (response) {
					});
				}
			};
		}
	]);
