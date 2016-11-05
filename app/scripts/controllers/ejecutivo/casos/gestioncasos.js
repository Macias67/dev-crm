'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:CasosGestioncasosCtrl
 * @description
 * # CasosGestioncasosCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('GestionCasosCtrl', [
		'$rootScope', '$scope', 'dataCaso', '$uibModal', 'Caso',
		function ($rootScope, $scope, dataCaso, $uibModal, Caso) {
			var vm  = this;
			vm.caso = dataCaso.data;
			
			setTimeout(function () {
				App.unblockUI('#ui-view');
			}, 2000);
			
			vm.avisos = {
				reasignaCaso: function () {
					return vm.caso.estatus.id == 2 || vm.caso.estatus.id == 3;
				},
				atrasoTarea : function (tarea) {
					if (tarea == null) {
						return false;
					}
					return tarea.fecha_tentativa_cierre < moment().unix();
				},
				atrasoCaso  : function () {
					return vm.caso.fecha_tentativa_precierre <= moment().unix();
				}
			};
			
			vm.calculoAvanceGeneral = function () {
				var total = 0;
				vm.caso.tareas.forEach(function (tarea, index) {
					total += tarea.avance;
				});
				return total / vm.caso.tareas.length;
			};
			
			vm.nuevaTarea = function (idCaso) {
				App.scrollTop();
				App.blockUI({
					target      : '#ui-view',
					animate     : true,
					overlayColor: App.getBrandColor('gray'),
					zIndex      : 9999
				});
				$uibModal.open({
					backdrop   : 'false',
					templateUrl: 'modalNuevaTarea.html',
					controller : 'ModalNuevaTarea as modalNuevaTarea',
					resolve    : {
						dataEjecutivos: [
							'Ejecutivo', function (Ejecutivo) {
								return Ejecutivo.get({online: true}).$promise;
							}
						],
						idCaso        : idCaso
					}
				});
			};
			
			vm.modalDistribucionTareas = function () {
				App.blockUI({
					target      : '#ui-view',
					animate     : true,
					overlayColor: App.getBrandColor('blue'),
					zIndex      : 9999
				});
				$uibModal.open({
					backdrop   : 'static',
					templateUrl: 'modalGestionTareas.html',
					controller : 'ModalDistribucionTareas as modalDistribucionTareas',
					resolve    : {
						dataEjecutivos: [
							'Ejecutivo', function (Ejecutivo) {
								return Ejecutivo.get({online: true}).$promise;
							}
						]
					}
				});
			};
			
			vm.calculoDiferenciaCierreCaso = function () {
				
			};
			
			vm.reloadTareas = function () {
				App.scrollTop();
				App.blockUI({
					target      : '#ui-view',
					animate     : true,
					overlayColor: App.getBrandColor('blue'),
					zIndex      : 9999
				});
				Caso.get({id: vm.caso.id}, function (response) {
					App.unblockUI('#ui-view');
					vm.caso = response.data;
				});
			};
			
			vm.detalleTarea = function (idTarea) {
				App.blockUI({
					target      : '#ui-view',
					animate     : true,
					overlayColor: App.getBrandColor('blue'),
					zIndex      : 9999
				});
				
				$uibModal.open({
					backdrop   : 'static',
					templateUrl: 'modalDetallesTarea.html',
					controller : 'ModalDetalleTareas as modalDetalleTareas',
					size       : 'lg'
				});
			};
			
			vm.editaTarea = function (idTarea) {
				App.blockUI({
					target      : '#ui-view',
					animate     : true,
					overlayColor: App.getBrandColor('blue'),
					zIndex      : 9999
				});
				$uibModal.open({
					backdrop   : 'static',
					templateUrl: 'views/vista-ejecutivo/casos/modal/modalEditaTarea.html',
					controller : 'ModalEditaTareas as modalEditaTareas',
					size       : 'lg',
					resolve    : {
						tarea     : [
							'Tarea', function (Tarea) {
								return Tarea.get({idtarea: idTarea}).$promise
							}
						],
						ejecutivos: [
							'Ejecutivo', function (Ejecutivo) {
								return Ejecutivo.get({online: true}).$promise
							}
						]
					}
				});
			};
			
			$scope.$on('creadaNuevaTarea', function (e, args) {
				vm.caso = args;
			});
			
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
				App.scrollTop();
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Cargando datos del caso </b>',
					boxed       : true,
					zIndex      : 99999,
					overlayColor: App.getBrandColor('grey')
				});
				
				dataCaso.$promise.catch(function (err) {
					console.log(err);
				});
			});
			
			//Nombres
			$rootScope.vista = {
				titulo   : 'Caso No. ' + vm.caso.id,
				subtitulo: 'Cliente: ' + vm.caso.cliente.razonsocial
			};
			
			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
		}
	])
	.controller('ModalNuevaTarea', [
		'$rootScope',
		'$scope',
		'$uibModalInstance',
		'dataEjecutivos',
		'idCaso',
		'CasoTarea',
		'NotifService',
		function ($rootScope, $scope, $uibModalInstance, dataEjecutivos, idCaso, CasoTarea, NotifService) {
			App.unblockUI('#ui-view');
			
			var vm        = this;
			vm.ejecutivos = dataEjecutivos.data;
			
			vm.tareaForm = {};
			
			vm.tarea = {
				ejecutivo  : vm.ejecutivos[0],
				titulo     : null,
				descripcion: null
			};
			
			vm.guarda = function () {
				App.scrollTop();
				App.blockUI({
					target      : '#ui-view',
					message     : '<b>Generando nueva tarea</b>',
					boxed       : true,
					overlayColor: App.getBrandColor('grey'),
					zIndex      : 99999
				});
				
				var ejecutivo      = vm.tarea.ejecutivo;
				vm.tarea.ejecutivo = vm.tarea.ejecutivo.id;
				
				var casoTarea = new CasoTarea(vm.tarea);
				casoTarea.$save({idcaso: idCaso}).then(function (response) {
					if (response.hasOwnProperty('errors')) {
						for (var key in response.errors) {
							if (response.errors.hasOwnProperty(key)) {
								NotifService.error(response.errors[key][0], 'Hay errores con la tarea.');
							}
						}
						App.unblockUI('#ui-view');
					}
					else {
						$uibModalInstance.close();
						$rootScope.$broadcast('creadaNuevaTarea', response.data);
						setTimeout(function () {
							App.unblockUI('#ui-view');
						}, 1000);
						NotifService.success('Se generó nueva tarea para ' + ejecutivo.nombre + ' ' + ejecutivo.apellido + '.', 'Nueva tarea asignada.');
					}
				}, function (response) {
					App.unblockUI('#ui-view');
					NotifService.error('Ocurrio un error en el servidor, ponte contacto con departamento de desarrollo.', response.statusText + ' (' + response.status + ').');
				});
			};
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	])
	.controller('ModalDistribucionTareas', [
		'$rootScope', '$scope', '$uibModalInstance', 'dataEjecutivos', function ($rootScope, $scope, $uibModalInstance, dataEjecutivos) {
			var vm        = this;
			vm.ejecutivos = dataEjecutivos.data;
			App.unblockUI('#ui-view');
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	])
	.controller('ModalDetalleTareas', [
		'$rootScope', '$scope', '$uibModalInstance', function ($rootScope, $scope, $uibModalInstance) {
			var vm = this;
			App.unblockUI('#ui-view');
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	])
	.controller('ModalEditaTareas', [
		'$rootScope',
		'$scope',
		'$uibModalInstance',
		'tarea',
		'ejecutivos',
		'$ngBootbox',
		'$timeout',
		function ($rootScope, $scope, $uibModalInstance, tarea, ejecutivos, $ngBootbox, $timeout) {
			var vm = this;
			
			App.unblockUI('#ui-view');
			
			vm.tarea      = tarea.data;
			vm.ejecutivos = ejecutivos.data;
			vm.estatus    = [
				{
					'id'     : 3,
					'estatus': 'Proceso'
				},
				{
					'id'     : 4,
					'estatus': 'Cerrado'
				},
				{
					'id'     : 5,
					'estatus': 'Suspendido'
				}
			];
			
			vm.formTarea = {
				titulo              : vm.tarea.titulo,
				descripcion         : vm.tarea.descripcion,
				fechainicio         : new Date(moment.utc(vm.tarea.fecha_inicio, 'X')),
				duracion            : moment.utc(moment.duration(vm.tarea.duracion_tentativa_segundos, 's').asHours(), 'H').format('HH:mm'),
				duracionsegundos    : vm.tarea.duracion_tentativa_segundos,
				fechatentativacierre: new Date(moment.utc(vm.tarea.fecha_tentativa_cierre, 'X')),
				avance              : vm.tarea.avance,
				estatus             : vm.tarea.estatus.id,
				ejecutivo           : vm.tarea.ejecutivo.id,
				motivo              : ""
			};
			
			vm.deshabilitaMotivo = true;
			
			vm.fechas = {
				formFechatarea: null,
				fechainicio   : {
					open        : false,
					openCalendar: function () {
						vm.fechas.fechainicio.open = true;
					},
					options     : {
						//minDate    : moment(),
						showWeeks  : false,
						startingDay: 1
					}
				},
				fechacierre   : {
					open        : false,
					openCalendar: function () {
						vm.fechas.fechacierre.open = true;
					},
					options     : {
						showWeeks  : false,
						startingDay: 1,
						minDate    : moment(vm.formTarea.fechainicio).add(vm.tarea.duracion_tentativa_segundos, 's')
					}
				},
				fechatarea    : {
					fechainicio     : null,
					duracion        : null,
					duracionsegundos: 0,
					fechacierre     : null
				},
				guarda        : function () {
					var data = {
						fechainicio              : moment(vm.fechas.fechatarea.fechainicio).format("YYYY-MM-DD HH:mm:ss"),
						duraciontentativasegundos: vm.fechas.fechatarea.duracionsegundos,
						fechatentativacierre     : moment(vm.fechas.fechatarea.fechacierre).format("YYYY-MM-DD HH:mm:ss"),
					};
				}
			};
			
			vm.slider = {
				formNotas    : null,
				sliderOptions: {
					minLimit            : 0,
					floor               : 0,
					ceil                : 100,
					step                : 1,
					showTicks           : 5,
					translate           : function (value, sliderId, label) {
						switch (label) {
							case 'model':
								return '<b>Avance:</b> ' + value + '%';
							default:
								return value + '%'
						}
					},
					showSelectionBar    : true,
					getSelectionBarColor: function (value) {
						if (value <= 30) {
							return 'red';
						}
						if (value <= 60) {
							return 'orange';
						}
						if (value <= 80) {
							return 'yellow';
						}
						return '#2AE02A';
					},
					getPointerColor     : function (value) {
						if (value <= 30) {
							return 'red';
						}
						if (value <= 60) {
							return 'orange';
						}
						if (value <= 80) {
							return 'yellow';
						}
						return '#2AE02A';
					},
					getTickColor        : function (value) {
						if (value <= 30) {
							return 'red';
						}
						if (value <= 60) {
							return 'orange';
						}
						if (value <= 80) {
							return 'yellow';
						}
						return '#2AE02A';
					},
					onChange            : function () {
						
					}
				},
				loading      : false
			};
			
			App.unblockUI('#ui-view');
			
			$timeout(function () {
				$scope.$broadcast('rzSliderForceRender');
			}, 1000);
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
			
			$scope.$watch('modalEditaTareas.formTarea.fechainicio', function (newValue, oldValue) {
				if (newValue != oldValue) {
					if (vm.formTarea.duracion != undefined && vm.formTarea.duracion.includes(":")) {
						var duracion                          = moment.duration(vm.formTarea.duracion, 'HH:mm').asSeconds();
						vm.formTarea.duracionsegundos         = duracion;
						vm.fechas.fechacierre.options.minDate = moment(vm.formTarea.fechainicio).add(duracion, 's');
					}
					else {
						vm.formTarea.duracionsegundos         = 0;
						vm.fechas.fechacierre.options.minDate = moment(vm.formTarea.fechainicio).add(vm.tarea.duracion_tentativa_segundos, 's')
					}
					vm.formTarea.fechatentativacierre = null;
				}
			});
			
			$scope.$watch('modalEditaTareas.formTarea.duracion', function (newValue, oldValue) {
				if (newValue != oldValue) {
					if (vm.formTarea.duracion != undefined && vm.formTarea.duracion.includes(":")) {
						var duracion                          = moment.duration(vm.formTarea.duracion, 'HH:mm').asSeconds();
						vm.formTarea.duracionsegundos         = duracion;
						vm.fechas.fechacierre.options.minDate = moment(vm.formTarea.fechainicio).add(duracion, 's');
					}
					else {
						vm.formTarea.duracionsegundos         = 0;
						vm.fechas.fechacierre.options.minDate = moment(vm.formTarea.fechainicio).add(vm.tarea.duracion_tentativa_segundos, 's')
					}
					vm.formTarea.fechatentativacierre = null;
				}
			});
			
			$scope.$watch('modalEditaTareas.formTarea.estatus', function (newValue, oldValue) {
				if (newValue != oldValue) {
					if (vm.formTarea.estatus == 3) {
						vm.formTarea.avance = vm.tarea.avance;
					}
					else if (vm.formTarea.estatus == 4) {
						vm.formTarea.avance = 100;
						$ngBootbox.alert('<h4 class="font-red-mint bold">IMPORTANTE:</h4> Si cierras la tarea sin que el ejecutivo encargado terminé, podrías causar conflicto con las actividades del ejecutivo ' +
							'ya que se marcará el avance al 100%, es recomendable comunicar este cambio antes al ejecutivo encargado de la tarea.')
							.then(function () {
							});
					}
					else if (vm.formTarea.estatus == 5) {
						vm.formTarea.avance = vm.tarea.avance;
						$ngBootbox.alert('<h4 class="font-yellow-casablanca bold">AVISO:</h4> Si suspendes la tarea, el caso no podrá pasar a precierre una vez terminadas las demás tareas. Si el caso estará suspendido, se tendrá que cambiar manualmente en la gestión  del caso.')
							.then(function () {
							});
					}
				}
			});
			
			$scope.$watch('modalEditaTareas.formTarea.avance', function (newValue, oldValue) {
				if (newValue != oldValue) {
					if (vm.formTarea.avance == 100) {
						vm.formTarea.estatus = 4;
					}
					else if (vm.formTarea.estatus != 5 && vm.formTarea.avance != vm.tarea.avance) {
						vm.formTarea.estatus = 3;
					}
				}
			});
			
			$scope.$watch('modalEditaTareas.formTarea.ejecutivo', function (newValue, oldValue) {
				if (newValue != oldValue) {
					if (vm.formTarea.ejecutivo == vm.tarea.ejecutivo.id) {
						vm.deshabilitaMotivo = true;
						vm.formTarea.motivo  = "";
					}
					else {
						vm.deshabilitaMotivo = false;
						vm.formTarea.estatus = 3;
					}
				}
			});
		}
	])
;
