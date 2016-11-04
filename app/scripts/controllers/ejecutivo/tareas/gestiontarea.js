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
		'$rootScope',
		'$scope',
		'dataTarea',
		'$uibModal',
		'authUser',
		'$state',
		'Caso',
		'Tarea',
		'NotifService',
		'$filter',
		'TareaNota',
		'NotaFB',
		'$timeout',
		'TareaAgenda',
		'EjecutivoAgenda',
		'$q',
		'$firebaseArray',
		'$firebaseObject',
		'TareaTiempos',
		'$ngBootbox',
		function ($rootScope, $scope, dataTarea, $uibModal, authUser, $state, Caso, Tarea, NotifService, $filter, TareaNota, NotaFB, $timeout, TareaAgenda, EjecutivoAgenda, $q, $firebaseArray, $firebaseObject, TareaTiempos, $ngBootbox) {
			var vm = this;
			
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
					fechainicio     : null,
					duracion        : null,
					duracionsegundos: 0,
					fechacierre     : null
				},
				abreAgenda    : function () {
					App.scrollTop();
					
					App.blockUI({
						target      : '#ui-view',
						message     : '<b>Abriendo agenda </b>',
						boxed       : true,
						zIndex      : 99999,
						overlayColor: App.getBrandColor('grey')
					});
					
					$uibModal.open({
						backdrop   : 'static',
						templateUrl: 'modalVistaAgenda.html',
						controller : 'ModalVistaAgenda as modalVistaAgenda',
						resolve    : {
							dataEventos: [
								'$stateParams', 'Agenda', function ($stateParams, Agenda) {
									return Agenda.get({ejecutivo: authUser.getSessionData().id}).$promise;
								}
							]
						},
						size       : 'lg'
					});
				},
				guarda        : function () {
					
					var data = {
						fechainicio              : moment(vm.fechas.fechatarea.fechainicio).format("YYYY-MM-DD HH:mm:ss"),
						duraciontentativasegundos: vm.fechas.fechatarea.duracionsegundos,
						fechatentativacierre     : moment(vm.fechas.fechatarea.fechacierre).format("YYYY-MM-DD HH:mm:ss"),
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
							
							vm.fechas.formFechatarea.$setPristine();
							vm.fechas.formFechatarea.$setUntouched();
							vm.fechas.formFechatarea.$dirty = false;
							vm.fechas.fechatarea            = {
								fechainicio     : null,
								duracion        : null,
								duracionsegundos: 0,
								fechacierre     : null
							};
						}
						else {
							console.log(response);
						}
					}, function (response) {
						App.unblockUI('#ui-view');
						NotifService.error('Ocurrió un error en el servidor, ponte contacto con departamento de desarrollo.', response.statusText + ' (' + response.status + ').');
					});
				}
			};
			
			vm.agenda = {
				formFechaAgenda: null,
				fechaInicio    : null,
				duracion       : null,
				open           : false,
				options        : {
					minDate    : moment(),
					showWeeks  : false,
					startingDay: 1
				},
				openCalendar   : function () {
					vm.agenda.open = true;
				},
				reloadAgenda   : function () {
					App.blockUI({
						target      : '#miagenda',
						message     : '<b> Actualizando recordatorios. </b>',
						boxed       : true,
						zIndex      : 99999,
						overlayColor: App.getBrandColor('grey')
					});
					
					TareaAgenda.get({idtarea: dataTarea.data.id, notificado: false}).$promise.then(function (response) {
						if (response.$resolved) {
							vm.recordatorios = response.data;
							App.unblockUI('#miagenda');
						}
					}, function (response) {
						App.unblockUI('#miagenda');
						NotifService.error('Ocurrió un error en el servidor, ponte contacto con departamento de desarrollo.', response.statusText + ' (' + response.status + ').');
					});
				},
				abreAgenda     : function () {
					App.scrollTop();
					App.blockUI({
						target      : '#ui-view',
						message     : '<b>Abriendo agenda </b>',
						boxed       : true,
						zIndex      : 99999,
						overlayColor: App.getBrandColor('grey')
					});
					
					$uibModal.open({
						backdrop   : 'static',
						templateUrl: 'modalVistaAgenda.html',
						controller : 'ModalVistaAgenda as modalVistaAgenda',
						resolve    : {
							dataEventos: [
								'TareaAgenda', function (TareaAgenda) {
									return TareaAgenda.get({idtarea: dataTarea.data.id}).$promise
								}
							]
						},
						size       : 'lg'
					});
				},
				guarda         : function () {
					var duracion = moment.duration(vm.agenda.duracion, 'HH:mm').asSeconds();
					var data     = {
						start           : moment(vm.agenda.fechaInicio).format("YYYY-MM-DD HH:mm:ss"),
						end             : moment(moment(vm.agenda.fechaInicio).add(duracion, 's')).format("YYYY-MM-DD HH:mm:ss"),
						duracionSegundos: duracion
					};
					
					App.blockUI({
						target      : '#miagenda',
						message     : '<b> Añadiendo evento a mi agenda. </b>',
						boxed       : true,
						zIndex      : 99999,
						overlayColor: App.getBrandColor('grey')
					});
					
					var tareaAgenda = new TareaAgenda(data);
					tareaAgenda.$save({idtarea: vm.tarea.id}).then(function (response) {
						if (response.$resolved) {
							App.unblockUI('#miagenda');
							vm.agenda.reloadAgenda();
							vm.agenda.formFechaAgenda.$setPristine();
							vm.agenda.formFechaAgenda.$setUntouched();
							vm.agenda.formFechaAgenda.$dirty = false;
							vm.agenda.fechaInicio            = null;
							vm.agenda.duracion               = null;
						}
					}, function (response) {
						NotifService.error('Error al actualizar agenda, comunica esto al departamento de desarrollo.', response.statusText + ' (' + response.status + ')');
						App.unblockUI('#miagenda');
					});
				},
				elimina        : function (id) {
					App.blockUI({
						target      : '#miagenda',
						message     : '<b> Borrando. </b>',
						boxed       : true,
						zIndex      : 99999,
						overlayColor: App.getBrandColor('grey')
					});
					
					TareaAgenda.delete({
						idtarea : vm.tarea.id,
						idagenda: id
					}).$promise.then(function (response) {
						if (response.$resolved) {
							App.unblockUI('#miagenda');
							vm.agenda.reloadAgenda();
						}
					}, function (response) {
						App.unblockUI('#miagenda');
						NotifService.error('Error al eliminar evento, comunica esto al departamento de desarrollo.', response.statusText + ' (' + response.status + ')');
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
						
					}
				},
				form         : {
					descripcion: '',
					tipo       : 1,
					avance     : vm.tarea.avance,
					file       : null
				},
				loading      : false,
				progress     : 0,
				lista        : vm.tarea.notas.todas,
				tipo         : 'todos',
				titulo       : 'Todos',
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
								vm.notas.progress = $filter('number')(progress, 0);
							});
						}, function (error) {
							// Handle unsuccessful uploads
							console.log('error subida', error);
							vm.notas.loading = false;
						}, function () {
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
								var desertRef = storageRef.child(uploadTask.snapshot.metadata.name);
								desertRef.delete().then(function () {
								}).catch(function (error) {
								});
								
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
								
								NotifService.error('Error al guardar nota, comunica esto al departamento de desarrollo.', error.statusText + ' (' + error.status + ')');
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
						}, function (response) {
							NotifService.error('Error al guardar nota, comunica esto al departamento de desarrollo.', response.statusText + ' (' + response.status + ')');
							vm.notas.loading = false;
						});
					}
				},
				filtro       : function (tipo) {
					
					App.blockUI({
						target      : '#lista-comentarios',
						animate     : true,
						overlayColor: App.getBrandColor('grey')
					});
					
					switch (tipo) {
						case 'todos':
							vm.notas.lista  = vm.tarea.notas.todas;
							vm.notas.titulo = 'Todos';
							break;
						case 'publicos':
							vm.notas.lista  = vm.tarea.notas.publicas;
							vm.notas.titulo = 'Públicos';
							break;
						case 'privados':
							vm.notas.lista  = vm.tarea.notas.privadas;
							vm.notas.titulo = 'Privados';
							break;
					}
					
					vm.notas.tipo = tipo;
					
					App.unblockUI('#lista-comentarios');
				},
				elimina      : function (nota) {
					$ngBootbox.confirm('¿Seguro de eliminar esta nota?')
						.then(function () {
							App.blockUI({
								target      : '#nota' + nota.id,
								message     : '<b> Borrando. </b>',
								boxed       : true,
								zIndex      : 99999,
								overlayColor: App.getBrandColor('grey')
							});
							
							if (nota.archivos.length > 0) {
								var q = [];
								angular.forEach(nota.archivos, function (val, key) {
									this.push(firebase.storage().ref().child(val.path).delete());
								}, q);
								
								$q.all(q).then(function () {
									TareaNota.delete({
										idtarea: vm.tarea.id,
										idnota : nota.id
									}).$promise.then(function (response) {
										if (response.$resolved) {
											App.unblockUI('#nota' + nota.id);
											vm.reloadCaso();
											vm.notas.filtro(vm.notas.tipo);
										}
									}, function (response) {
										App.unblockUI('#nota' + nota.id);
										NotifService.error('Error al eliminar nota, comunica esto al departamento de desarrollo.', response.statusText + ' (' + response.status + ')');
									});
								}, function (results) {
									NotifService.error('Error al borrar imagenes, comunica esto al departamento de desarrollo.', results.statusText + '(' + results.status + ')');
									App.unblockUI('#ui-view');
								});
							}
							else {
								TareaNota.delete({
									idtarea: vm.tarea.id,
									idnota : nota.id
								}).$promise.then(function (response) {
									if (response.$resolved) {
										App.unblockUI('#nota' + nota.id);
										vm.reloadCaso();
										vm.notas.filtro(vm.notas.tipo);
									}
								}, function (response) {
									App.unblockUI('#nota' + nota.id);
									NotifService.error('Error al eliminar nota, comunica esto al departamento de desarrollo.', response.statusText + ' (' + response.status + ')');
								});
							}
						});
				},
				edita        : function (nota) {
					$ngBootbox.prompt('Edita la nota', nota.nota)
						.then(function (result) {
							App.blockUI({
								target      : '#nota' + nota.id,
								message     : '<b> Actualizando. </b>',
								boxed       : true,
								zIndex      : 99999,
								overlayColor: App.getBrandColor('grey')
							});
							
							var data = {
								nota   : result,
								publico: nota.publico,
								avance : nota.avance
							};
							TareaNota.update({idtarea: vm.tarea.id, idnota: nota.id}, data).$promise.then(function (response) {
								if (response.$resolved) {
									vm.reloadCaso();
								}
							}, function (response) {
								if (response.data.hasOwnProperty('errors') && response.status == 422) {
									for (var key in response.data.errors) {
										if (response.data.errors.hasOwnProperty(key)) {
											NotifService.error(response.data.errors[key][0], 'Error con el formulario.');
										}
									}
									App.unblockUI('#nota' + nota.id);
									return;
								}
								NotifService.error('Error al editar comentario, comunica esto al departamento de desarrollo.', response.statusText + '(' + response.status + ')');
								App.unblockUI('#nota' + nota.id);
							});
						});
				},
				cambia       : function (nota) {
					$ngBootbox.confirm('¿Seguro de cambiar la privacidad de esta nota?')
						.then(function () {
							App.blockUI({
								target      : '#nota' + nota.id,
								message     : '<b> Actualizando. </b>',
								boxed       : true,
								zIndex      : 99999,
								overlayColor: App.getBrandColor('grey')
							});
							
							var data = {
								nota   : nota.nota,
								publico: !nota.publico,
								avance : nota.avance
							};
							TareaNota.update({idtarea: vm.tarea.id, idnota: nota.id}, data).$promise.then(function (response) {
								if (response.$resolved) {
									vm.reloadCaso();
								}
							}, function (response) {
								if (response.data.hasOwnProperty('errors') && response.status == 422) {
									for (var key in response.data.errors) {
										if (response.data.errors.hasOwnProperty(key)) {
											NotifService.error(response.data.errors[key][0], 'Error con el formulario.');
										}
									}
									App.unblockUI('#nota' + nota.id);
									return;
								}
								NotifService.error('Error al editar comentario, comunica esto al departamento de desarrollo.', response.statusText + '(' + response.status + ')');
								App.unblockUI('#nota' + nota.id);
							});
						});
				}
			};
			
			vm.avisos = {
				defineFecha: function () {
					return vm.tarea.fecha_inicio == null || vm.tarea.fecha_tentativa_cierre == null || vm.tarea.duracion_minutos == 0;
				},
				atraso     : function () {
					return vm.tarea.fecha_tentativa_cierre < moment().unix();
				},
				ultimaTarea: true
			};
			
			vm.trabajaTarea = {
				tarea   : null,
				trabajar: function () {
					if (vm.trabajaTarea.tarea == null) {
						var ref               = firebase.database().ref('tarea-enproceso');
						var objeto            = $firebaseArray(ref);
						vm.trabajaTarea.tarea = {
							idTarea       : vm.tarea.id,
							idEjecutivo   : vm.tarea.ejecutivo.id,
							titulo        : vm.tarea.titulo,
							descripcion   : vm.tarea.descripcion,
							inicio        : moment().valueOf(),
							duracionMilis : 0,
							estaTrabajando: true
						};
						objeto.$add(vm.trabajaTarea.tarea).then(function () {
							$rootScope.$broadcast('recarga-tareas');
						}, function (err) {
							console.log(err);
						});
					}
					else {
						firebase.database().ref('tarea-enproceso/' + vm.trabajaTarea.tarea.idFirebase).update({
							estaTrabajando: true
						}, function () {
							$rootScope.$broadcast('recarga-tareas');
						});
					}
				},
				detener : function () {
					App.blockUI({
						target      : '#registro-tiempos',
						message     : '<b>Añadiendo tiempos</b>',
						boxed       : true,
						zIndex      : 99999,
						overlayColor: App.getBrandColor('grey')
					});
					
					firebase.database().ref('tarea-enproceso/' + vm.trabajaTarea.tarea.idFirebase).once('value').then(function (snapshot) {
						$timeout(function () {
							if (snapshot.val() != null) {
								var tarea = snapshot.val();
								var data  = {
									inicio  : moment(tarea.inicio).format('YYYY-MM-DD H:mm:ss'),
									fin     : moment().format('YYYY-MM-DD H:mm:ss'),
									duracion: tarea.duracionMilis / 1000
								};
								
								TareaTiempos.save({idtarea: vm.tarea.id}, data).$promise.then(function (response) {
									if (response.$resolved) {
										vm.tarea = response.data;
										firebase.database().ref('tarea-enproceso/' + vm.trabajaTarea.tarea.idFirebase).update({estaTrabajando: false});
										firebase.database().ref('tarea-enproceso/' + vm.trabajaTarea.tarea.idFirebase).remove().then(function () {
											$timeout(function () {
												vm.trabajaTarea.tarea = null;
												$rootScope.$broadcast('recarga-tareas');
												App.unblockUI('#registro-tiempos');
											});
										}, function (error) {
											console.log("Remove failed: " + error.message);
											App.unblockUI('#registro-tiempos');
											NotifService.error("Remove failed: " + error.message, 'Error al eliminar tarea en Firebase.');
										});
									}
								}, function (response) {
									App.unblockUI('#registro-tiempos');
									NotifService.error('Ocurrió un error en el servidor, ponte contacto con departamento de desarrollo.', response.statusText + ' (' + response.status + ').');
								});
							}
						});
					}, function (error) {
						console.log(error);
						App.unblockUI('#registro-tiempos');
						NotifService.error('Ocurrió un error al recuperar dato de Firebase, ponte contacto con departamento de desarrollo.', 'Error Firebase.');
					});
				}
			};
			
			firebase.database().ref('tarea-enproceso').orderByChild('idTarea').equalTo(vm.tarea.id).on('value', function (snapshot) {
				$timeout(function () {
					if (snapshot.val() != null) {
						snapshot.forEach(function (childSnapshot) {
							vm.trabajaTarea.tarea            = childSnapshot.val();
							vm.trabajaTarea.tarea.idFirebase = childSnapshot.key;
							$scope.$broadcast('rzSliderForceRender');
						});
					}
				});
			});
			
			vm.reloadCaso = function () {
				App.blockUI({
					target      : '#ui-view',
					animate     : true,
					overlayColor: App.getBrandColor('grey')
				});
				
				$q.all({
					caso           : Caso.get({id: vm.tarea.caso.id}).$promise,
					tarea          : Tarea.get({idtarea: vm.tarea.id}).$promise,
					ejecutivoAgenda: TareaAgenda.get({idtarea: dataTarea.data.id, notificado: false}).$promise
				}).then(function (results) {
					vm.caso  = results.caso.data;
					vm.tarea = results.tarea.data;
					vm.notas.filtro(vm.notas.tipo);
					vm.notas.form.avance            = vm.tarea.avance;
					vm.notas.sliderOptions.minLimit = vm.tarea.avance;
					vm.recordatorios                = results.ejecutivoAgenda.data;
					
					$timeout(function () {
						$scope.$broadcast('rzSliderForceRender');
					});
					App.unblockUI('#ui-view');
				}, function (results) {
					NotifService.error('Error al cargar algunos datos, comunica esto al departamento de desarrollo.', results.statusText + '(' + results.status + ')');
					App.unblockUI('#ui-view');
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
				
				$timeout(function () {
					$scope.$broadcast('rzSliderForceRender');
				});
				
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Cargando datos de la tarea </b>',
					boxed       : true,
					zIndex      : 99999,
					overlayColor: App.getBrandColor('grey')
				});
				
				$q.all({
					caso           : Caso.get({id: dataTarea.data.caso.id}).$promise,
					ejecutivoAgenda: TareaAgenda.get({idtarea: dataTarea.data.id, notificado: false}).$promise
				}).then(function (results) {
					vm.caso          = results.caso.data;
					vm.recordatorios = results.ejecutivoAgenda.data;
					App.unblockUI('#ui-view');
				}, function (results) {
					NotifService.error('Error al cargar algunos datos, comunica esto al departamento de desarrollo.', results.statusText + '(' + results.status + ')');
					App.unblockUI('#ui-view');
				});
				
				dataTarea.$promise.catch(function (err) {
					console.log(err);
				});
			});
			
			$scope.$watch('gestionTareaCtrl.fechas.fechatarea.duracion', function () {
				if (vm.fechas.fechatarea.duracion != undefined && vm.fechas.fechatarea.duracion.includes(":")) {
					var duracion                          = moment.duration(vm.fechas.fechatarea.duracion, 'HH:mm').asSeconds();
					vm.fechas.fechatarea.duracionsegundos = duracion;
					vm.fechas.fechacierre.options.minDate = moment(vm.fechas.fechatarea.fechainicio).add(duracion, 's');
				}
				else {
					vm.fechas.fechatarea.duracionsegundos = 0;
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
		'$rootScope', '$scope', '$uibModalInstance', '$filter', '$ngBootbox', 'dataEventos', '$compile', 'uiCalendarConfig',
		function ($rootScope, $scope, $uibModalInstance, $filter, $ngBootbox, dataEventos, $compile, uiCalendarConfig) {
			App.unblockUI('#ui-view');
			
			var vm = this;
			
			var date = new Date();
			var d    = date.getDate();
			var m    = date.getMonth();
			var y    = date.getFullYear();
			
			$scope.changeTo = 'Hungarian';
			/* event source that pulls from google.com */
			$scope.eventSource = {
				url            : "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
				className      : 'gcal-event',           // an option!
				currentTimezone: 'America/Chicago' // an option!
			};
			/* event source that contains custom events on the scope */
			$scope.events = [
				{title: 'All Day Event', start: new Date(y, m, 1), backgroundColor: App.getBrandColor('yellow')},
				{title: 'Long Event', start: new Date(y, m, d - 5), end: new Date(y, m, d - 2)},
				{id: 999, title: 'Repeating Event', start: new Date(y, m, d - 3, 16, 0), allDay: false, backgroundColor: App.getBrandColor('yellow')},
				{id: 999, title: 'Repeating Event', start: new Date(y, m, d + 4, 16, 0), allDay: false},
				{title: 'Birthday Party', start: new Date(y, m, d + 1, 19, 0), end: new Date(y, m, d + 1, 22, 30), allDay: false},
				{title: 'Click for Google', start: new Date(y, m, 28), end: new Date(y, m, 29), url: 'http://google.com/'}
			];
			/* event source that calls a function on every view switch */
			$scope.eventsF = function (start, end, timezone, callback) {
				var s      = new Date(start).getTime() / 1000;
				var e      = new Date(end).getTime() / 1000;
				var m      = new Date(start).getMonth();
				var events = [{title: 'Feed Me ' + m, start: s + (50000), end: s + (100000), allDay: false, className: ['customFeed']}];
				callback(events);
			};
			
			$scope.calEventsExt = {
				events: []
			};
			
			angular.forEach(dataEventos.data, function (evento, index) {
				$scope.calEventsExt.events[index] = {
					id         : evento.id,
					title      : evento.tarea.titulo,
					descripcion: evento.tarea.descripcion,
					start      : moment(evento.start, 'X').format(),
					end        : moment(evento.end, 'X').format(),
					allDay     : false,
					color      : evento.ejecutivo.color,
					evento     : evento
				};
			});
			
			/* alert on eventClick */
			$scope.alertOnEventClick = function (date, jsEvent, view) {
				
				var options = {
					message: '<h6 class="bold">Caso #' + date.evento.caso.id + ' | ' + date.evento.caso.cliente.razonsocial + '</h6>' +
					'<p class="lead">' + date.evento.tarea.descripcion + '</p>',
					title  : date.title + ' | ' + date.start.format('h:mm a') + ' a ' + date.end.format('h:mm a'),
					buttons: {
						success: {
							label    : "Ok",
							className: "btn-success",
							callback : function () {
							}
						}
					}
				};
				$ngBootbox.customDialog(options);
				console.log(date);
			};
			/* alert on Drop */
			$scope.alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
				console.log('Event Droped to make dayDelta ' + delta);
			};
			/* alert on Resize */
			$scope.alertOnResize = function (event, delta, revertFunc, jsEvent, ui, view) {
				console.log('Event Resized to make dayDelta ' + delta);
			};
			/* add and removes an event source of choice */
			$scope.addRemoveEventSource = function (sources, source) {
				var canAdd = 0;
				angular.forEach(sources, function (value, key) {
					if (sources[key] === source) {
						sources.splice(key, 1);
						canAdd = 1;
					}
				});
				if (canAdd === 0) {
					sources.push(source);
				}
			};
			/* add custom event*/
			$scope.addEvent = function () {
				$scope.events.push({
					title    : 'Open Sesame',
					start    : new Date(y, m, 28),
					end      : new Date(y, m, 29),
					className: ['openSesame']
				});
			};
			/* remove event */
			$scope.remove = function (index) {
				$scope.events.splice(index, 1);
			};
			/* Change View */
			$scope.changeView = function (view, calendar) {
				uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
			};
			/* Change View */
			$scope.renderCalender = function (calendar) {
				if (uiCalendarConfig.calendars[calendar]) {
					uiCalendarConfig.calendars[calendar].fullCalendar('render');
				}
			};
			/* Render Tooltip */
			$scope.eventRender = function (event, element, view) {
				element.attr({
					'tooltip'               : event.title,
					'tooltip-append-to-body': true
				});
				$compile(element)($scope);
			};
			/* config object */
			vm.uiConfig = {
				calendar: {
					height     : 430,
					editable   : false,
					header     : {
						left  : 'prev,next',
						center: 'title',
						right : 'today,month,agendaWeek,agendaDay'
					},
					eventClick : $scope.alertOnEventClick,
					eventDrop  : $scope.alertOnDrop,
					eventResize: $scope.alertOnResize,
					eventRender: $scope.eventRender
				}
			};
			
			/* event sources array*/
			vm.eventSources  = [$scope.events, $scope.eventSource, $scope.eventsF];
			vm.eventSources2 = [$scope.calEventsExt];
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	]);
