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
		'$rootScope', '$scope', 'dataTarea', '$uibModal', 'authUser', '$state', 'Caso', 'Tarea', 'NotifService', '$filter', 'TareaNota', 'NotaFB', '$timeout',
		function ($rootScope, $scope, dataTarea, $uibModal, authUser, $state, Caso, Tarea, NotifService, $filter, TareaNota, NotaFB, $timeout) {
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
				abreAgenda: function () {
					$uibModal.open({
						backdrop   : 'static',
						templateUrl: 'modalVistaAgenda.html',
						controller : 'ModalVistaAgenda as modalVistaAgenda',
						resolve    : {
							dataIDTarea: vm.tarea.id
						}
					});
				},
				guarda        : function () {
					
					var data = {
						fechainicio         : moment(vm.fechas.fechatarea.fechainicio).format("YYYY-MM-DD HH:mm:ss"),
						duracionminutos     : vm.fechas.fechatarea.duracionminutos,
						fechatentativacierre: moment(vm.fechas.fechatarea.fechacierre).format("YYYY-MM-DD HH:mm:ss"),
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
					App.blockUI({
						target      : '#ui-view',
						message     : '<b>Estableciendo fechas </b>',
						boxed       : true,
						overlayColor: App.getBrandColor('grey'),
						zIndex      : 99999
					});
					
					var tarea = new Tarea(data);
					tarea.$asignafecha({idtarea: vm.tarea.id}).then(function (response) {
						if (response.$resolved) {
							vm.reloadCaso();
							NotifService.success('Se ha definido la fecha de inicio de la tarea, tiempo de duración aproximada y fecha de cierre tentativo.', 'Fechas definidas de la tarea.');
						}
						else {
							console.log(response);
						}
					}, function (response) {
						App.unblockUI('#ui-view');
						console.log(response);
					});
					
				}
			};
			
			vm.notas = {
				formNotas    : null,
				sliderOptions: {
					minLimit            : vm.tarea.avance,
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
						
					},
				},
				form         : {
					descripcion: '',
					tipo       : 1,
					avance     : vm.tarea.avance,
					file       : null
				},
				loading      : false,
				progress     : 0,
				guarda       : function () {
					vm.notas.loading = true;
					var file         = vm.notas.form.file;
					
					if (file != null) {
						var storageRef = firebase.storage().ref('notas/' + vm.tarea.id);
						var uploadTask = storageRef.child(file.name).put(file);
						uploadTask.on('state_changed', function (snapshot) {
							// Observe state change events such as progress, pause, and resume
							// See below for more detail
							var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
							$scope.$apply(function () {
								vm.notas.progress =  $filter('number')(progress, 0);
							});
						}, function (error) {
							// Handle unsuccessful uploads
							console.log('error subida', error);
							vm.notas.loading = false;
						}, function () {
							// Handle successful uploads on complete
							// For instance, get the download URL: https://firebasestorage.googleapis.com/...
							vm.notas.form.archivo = {
								url        : uploadTask.snapshot.downloadURL,
								contentType: uploadTask.snapshot.metadata.contentType,
								fullPath   : uploadTask.snapshot.metadata.fullPath,
								hash       : uploadTask.snapshot.metadata.md5Hash,
								name       : uploadTask.snapshot.metadata.name,
								size       : uploadTask.snapshot.metadata.size
							};
							delete vm.notas.form.file;
							
							var tareaNota = new TareaNota(vm.notas.form);
							tareaNota.$save({idtarea: vm.tarea.id}).then(function (response) {
								if (response.$resolved) {
									vm.notas.formNotas.$setPristine();
									vm.notas.formNotas.$setUntouched();
									vm.notas.formNotas.$dirty = false;
									
									vm.notas.form.descripcion = '';
									vm.notas.form.tipo        = 1;
									vm.notas.form.avance      = response.data.avance;
									vm.notas.form.file        = null;
									
									vm.notas.loading                = false;
									vm.notas.progress               = 0;
									vm.notas.sliderOptions.minLimit = response.data.avance;
									vm.reloadCaso();
									
									NotifService.success('Se añadio una nueva nota a la tarea', 'Nueva nota añadida');
								}
							}, function (error) {
								
								// Create a reference to the file to delete
								var desertRef = storageRef.child(uploadTask.snapshot.metadata.name);
								// Delete the file
								desertRef.delete().then(function () {
									// File deleted successfully
								}).catch(function (error) {
									// Uh-oh, an error occurred!
								});
								
								console.log(error);
								vm.notas.loading = false;
							});
						});
					}
					else {
						var tareaNota = new TareaNota(vm.notas.form);
						tareaNota.$save({idtarea: vm.tarea.id}).then(function (response) {
							if (response.$resolved) {
								vm.notas.formNotas.$setPristine();
								vm.notas.formNotas.$setUntouched();
								vm.notas.formNotas.$dirty = false;
								
								vm.notas.form.descripcion = '';
								vm.notas.form.tipo        = 1;
								vm.notas.form.avance      = response.data.avance;
								vm.notas.form.file        = null;
								
								vm.notas.loading                = false;
								vm.notas.progress               = 0;
								vm.notas.sliderOptions.minLimit = response.data.avance;
								vm.reloadCaso();
								
								NotifService.success('Se añadio una nueva nota a la tarea', 'Nueva nota añadida');
							}
						}, function (error) {
							console.log(error);
							vm.notas.loading = false;
						});
					}
				}
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
					vm.tarea                        = response.data;
					vm.notas.form.avance            = vm.tarea.avance;
					vm.notas.sliderOptions.minLimit = vm.tarea.avance;
					cargadoTarea                    = true;
					
					$timeout(function () {
						$scope.$broadcast('rzSliderForceRender');
					});
					
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
				$timeout(function () {
					$scope.$broadcast('rzSliderForceRender');
				});
				
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
	.controller('ModalVistaAgenda', [
		'$rootScope', '$scope', '$uibModalInstance', '$filter', 'toastr', 'dataIDTarea',
		function ($rootScope, $scope, $uibModalInstance, $filter, toastr, dataIDTarea) {
			var vm = this;
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	]);
