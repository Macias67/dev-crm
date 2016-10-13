'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:TareasGestiontareactrlCtrl
 * @description
 * # TareasGestiontareactrlCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('GestionTareaCtrl', [
		'$rootScope', '$scope', 'dataTarea', '$uibModal', 'authUser', '$state', 'Caso', 'Tarea', 'NotifService', '$filter', 'TareaNota', 'NotaFB',
		function ($rootScope, $scope, dataTarea, $uibModal, authUser, $state, Caso, Tarea, NotifService, $filter, TareaNota, NotaFB) {
			var vm   = this;
			vm.tarea = dataTarea.data;
			
			vm.fechas = {
				formFechatarea: null,
				fechainicio   : {
					open        : false,
					openCalendar: function () {
						vm.fechas.fechainicio.open = true;
					},
					options     : {
						minDate    : moment(),
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
						minDate    : moment()
					}
				},
				fechatarea    : {
					fechainicio    : null,
					duracion       : null,
					duracionminutos: 0,
					fechacierre    : null
				},
				guarda        : function () {
					
					var data = {
						fechainicio    :  moment(vm.fechas.fechatarea.fechainicio).format("YYYY-MM-DD HH:mm:ss"),
						duracionminutos: vm.fechas.fechatarea.duracionminutos,
						fechatentativacierre    :  moment(vm.fechas.fechatarea.fechacierre).format("YYYY-MM-DD HH:mm:ss"),
					};
					
					vm.fechas.formFechatarea.$setPristine();
					vm.fechas.formFechatarea.$setUntouched();
					vm.fechas.formFechatarea.$dirty = false;
					vm.fechas.fechatarea            = {
						fechainicio    : null,
						duracion       : null,
						duracionminutos: 0,
						fechacierre    : null
					};
					console.log(data);
					App.blockUI({
						target      : '#ui-view',
						message     : '<b>Estableciendo fechas </b>',
						boxed       : true,
						overlayColor: App.getBrandColor('grey'),
						zIndex      : 99999
					});
					
					var tarea = new Tarea(data);
					tarea.$update({idtarea: vm.tarea.id}).then(function (response) {
						App.unblockUI('#ui-view');
						console.log(response);
						//vm.tarea = response.data;
					}, function (response) {
						App.unblockUI('#ui-view');
					});
					
				}
			};
			
			$scope.$watch('gestionTareaCtrl.fechas.fechatarea.duracion', function () {
				if (vm.fechas.fechatarea.duracion != undefined && vm.fechas.fechatarea.duracion.includes(":")) {
					var tiempo                            = vm.fechas.fechatarea.duracion.split(':');
					var horas                             = parseInt(tiempo[0]);
					var minutos                           = parseInt(tiempo[1]);
					var totalminutos                      = (horas * 60) + minutos;
					//console.log(horas, minutos, totalminutos);
					vm.fechas.fechatarea.duracionminutos  = totalminutos;
					vm.fechas.fechacierre.options.minDate = moment(vm.fechas.fechatarea.fechainicio).add(totalminutos, 'm');
				}
				else {
					vm.fechas.fechatarea.duracionminutos  = 0;
					vm.fechas.fechacierre.options.minDate = moment();
				}
			});
			
			vm.notas = {
				formNotas: null,
				form     : {
					descripcion: '',
					tipo       : 1,
					file       : null
				},
				loading  : false,
				progress : 0,
				guarda   : function () {
					vm.notas.loading = true;
					
					var tareaNota = new TareaNota(vm.notas.form);
					tareaNota.$save({idtarea: vm.tarea.id}, function (response) {
						vm.tarea         = response.data;
						var notas        = vm.tarea.notas.todas;
						var selectedNota = notas[notas.length - 1];
						NotaFB.refObject(selectedNota.id).set(selectedNota)
							.then(function () {
								console.log('Synchronization succeeded');
							})
							.catch(function (error) {
								console.log('Synchronization failed');
							});
						
						vm.notas.loading = false;
					}, function (error) {
						console.log(error);
						vm.notas.loading = false;
					});
					
					
					var file = vm.notas.form.file;
					if (file != null) {
						var uploadTask = firebase.storage().ref().child('notas/' + file.name).put(file);
						uploadTask.on('state_changed', function (snapshot) {
							// Observe state change events such as progress, pause, and resume
							// See below for more detail
							$scope.$apply(function () {
								vm.notas.progress = $filter('number')((snapshot.bytesTransferred / snapshot.totalBytes) * 100, 0);
							});
						}, function (error) {
							// Handle unsuccessful uploads
						}, function () {
							// Handle successful uploads on complete
							// For instance, get the download URL: https://firebasestorage.googleapis.com/...
							var downloadURL = uploadTask.snapshot.downloadURL;
							console.log(downloadURL);
							$scope.$apply(function () {
								vm.notas.formNotas.$setPristine();
								vm.notas.formNotas.$setUntouched();
								vm.notas.formNotas.$dirty = false;
								vm.notas.form             = {
									descripcion: '',
									tipo       : 1,
									file       : null
								};
								vm.notas.loading          = false;
								vm.notas.progress         = 0;
							});
						});
					}
				}
			};
			
			vm.modalAsignaFechas = function () {
				$uibModal.open({
					backdrop   : 'static',
					templateUrl: 'modalAsignaFechas.html',
					controller : 'ModalAsignaFechas as modalAsignaFechas',
					resolve    : {
						dataIDTarea: vm.tarea.id
					}
				});
			};
			
			vm.reloadCaso = function () {
				var cargadoCaso  = false;
				var cargadoTarea = false;
				App.scrollTop();
				App.blockUI({
					target      : '#ui-view',
					animate     : true,
					overlayColor: App.getBrandColor('grey')
				});
				
				Caso.get({id: vm.tarea.caso.id}, function (response) {
					vm.caso     = response.data;
					cargadoCaso = true;
					
					if (cargadoTarea) {
						App.unblockUI('#ui-view');
					}
				});
				
				Tarea.get({idtarea: vm.tarea.id}, function (response) {
					vm.tarea     = response.data;
					cargadoTarea = true;
					
					if (cargadoCaso) {
						App.unblockUI('#ui-view');
					}
				});
				
				
			};
			
			vm.vistaCaso = function () {
				if (vm.tarea.caso.lider.id == authUser.getSessionData().id) {
					$state.go('caso', {idcaso: vm.tarea.caso.id});
				}
				else {
					alert('no eres lider');
				}
			};
			
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
				App.scrollTop();
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Cargando datos de la tarea </b>',
					boxed       : true,
					zIndex      : 99999,
					overlayColor: App.getBrandColor('grey')
				});
				
				Caso.get({id: vm.tarea.caso.id}, function (response) {
					vm.caso = response.data;
					App.unblockUI('#ui-view');
				});
				
				dataTarea.$promise.catch(function (err) {
					console.log(err);
				});
			});
			
			//Nombres
			$rootScope.vista = {
				titulo   : 'Tarea No. ' + vm.tarea.id,
				subtitulo: 'Gestión de la tarea. '
			};
			
			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
		}
	])
	.controller('ModalAsignaFechas', [
		'$rootScope', '$scope', '$uibModalInstance', '$filter', 'toastr', 'dataIDTarea',
		function ($rootScope, $scope, $uibModalInstance, $filter, toastr, dataIDTarea) {
			var vm = this;
			
			vm.fechainicio = {
				open        : false,
				openCalendar: function () {
					vm.fechainicio.open = true;
				},
				options     : {
					minDate    : moment(),
					showWeeks  : false,
					startingDay: 1
				}
			};
			
			vm.fechacierre = {
				open        : false,
				openCalendar: function () {
					vm.fechacierre.open = true;
				},
				options     : {
					showWeeks  : false,
					startingDay: 1,
					minDate    : moment()
				}
			};
			
			vm.fechatarea = {
				fechainicio    : null,
				duracion       : null,
				duracionminutos: 0,
				fechacierre    : null
			};
			
			$scope.$watch('modalAsignaFechas.fechatarea.duracion', function () {
				if (vm.fechatarea.duracion != undefined && vm.fechatarea.duracion.includes(":")) {
					var tiempo                     = vm.fechatarea.duracion.split(':');
					var horas                      = parseInt(tiempo[0]);
					var minutos                    = parseInt(tiempo[1]);
					var totalminutos               = (horas * 60) + minutos;
					//console.log(horas, minutos, totalminutos);
					vm.fechatarea.duracionminutos  = totalminutos;
					vm.fechacierre.options.minDate = moment(vm.fechatarea.fechainicio).add(totalminutos, 'm');
				}
				else {
					vm.fechatarea.duracionminutos  = 0;
					vm.fechacierre.options.minDate = moment();
				}
			});
			
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
					var producto = new Producto(vm.form);
					producto.$save(function (response) {
						if (response.hasOwnProperty('errors')) {
							for (var key in response.errors) {
								if (response.errors.hasOwnProperty(key)) {
									toastr.error(response.errors[key][0], 'Error con el formulario.');
								}
							}
						}
						else {
							$uibModalInstance.close();
							$rootScope.$broadcast('reloadTableProductos');
							toastr.success('Se registró un nuevo Producto', 'Nuevo Producto');
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
