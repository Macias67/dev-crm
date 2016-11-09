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
		'$rootScope', '$scope', 'dataCaso', 'dataEjecutivos', '$uibModal', 'Caso', '$timeout', 'authUser', 'ngAudio', 'Ejecutivo', '$ngBootbox', 'NotifService',
		function ($rootScope, $scope, dataCaso, dataEjecutivos, $uibModal, Caso, $timeout, authUser, ngAudio, Ejecutivo, $ngBootbox, NotifService) {
			var vm = this;
			
			App.blockUI({
				target      : '#ui-view',
				message     : '<b> Cargando datos del caso </b>',
				boxed       : true,
				zIndex      : 99999,
				overlayColor: App.getBrandColor('grey')
			});
			
			if (dataCaso.$resolved && dataEjecutivos.$resolved) {
				vm.ejecutivos = dataEjecutivos.data;
				vm.caso       = dataCaso.data;
				
				vm.validacionesVista = {
					esLider       : function () {
						return vm.caso.lider.id == authUser.getSessionData().id;
					},
					estaProceso   : function () {
						return vm.caso.estatus.id == 4;
					},
					estaPrecierre : function () {
						return vm.caso.estatus.id == 5;
					},
					estaCerrado   : function () {
						return vm.caso.estatus.id == 6;
					},
					estaSuspendido: function () {
						return vm.caso.estatus.id == 7;
					},
					estaCancelado : function () {
						return vm.caso.estatus.id == 8;
					},
					puedeReasignar: function () {
						return vm.validacionesVista.esLider() && (vm.validacionesVista.estaProceso() || vm.validacionesVista.estaSuspendido() || vm.validacionesVista.estaCancelado());
					}
				};
				
				App.unblockUI('#ui-view');
			}
			
			vm.avisos = {
				tienFechaPrecierre: function () {
					return vm.caso.fecha_tentativa_precierre != null;
				},
				asignaCaso        : function () {
					return vm.caso.estatus.id == 2;
				},
				reasignaCaso      : function () {
					return vm.caso.estatus.id == 3;
				},
				atrasoTarea       : function (tarea) {
					if (tarea == null) {
						return false;
					}
					return tarea.fecha_tentativa_cierre < moment().unix() && vm.avisos.tienFechaPrecierre();
				},
				atrasoCaso        : function () {
					return vm.caso.fecha_tentativa_precierre <= moment().unix();
				}
			};
			
			vm.reasignaCaso = {
				formulario: null,
				ejecutivos: vm.ejecutivos,
				ejecutivo : vm.caso.lider.id,
				motivo    : null,
				guarda    : function () {
					$ngBootbox.confirm('<h4>¿Estás seguro de reasignar este caso?</h4>').then(function (result) {
						App.scrollTop();
						App.blockUI({
							target      : '#ui-view',
							message     : '<b> Reasignando caso </b>',
							boxed       : true,
							zIndex      : 99999,
							overlayColor: App.getBrandColor('grey')
						});
						
						var data = {
							ejecutivo: vm.reasignaCaso.ejecutivo,
							motivo   : vm.reasignaCaso.motivo
						};
						
						Caso.reasigna({id: vm.caso.id}, data).$promise.then(function (response) {
							if (response.$resolved) {
								vm.reloadCaso();
								NotifService.success('Se ha avisado al ejecutivo ' + vm.caso.lider.nombre + ' que ahora es líder de este caso', 'Se ha reasignado el caso');
								App.unblockUI('#ui-view');
							}
						}, function (response) {
							NotifService.error('Error al reasginar el caso, informa esto al departamento de desarrollo.', response.statusText + ' (' + response.status + ')');
							App.unblockUI('#ui-view');
						});
					});
				}
			};
			
			vm.cambiaEstatus = {
				estatus     : [
					{
						'id'     : 4,
						'estatus': 'Proceso'
					},
					{
						'id'     : 5,
						'estatus': 'Precierre'
					},
					{
						'id'     : 6,
						'estatus': 'Cerrado'
					},
					{
						'id'     : 7,
						'estatus': 'Suspendido'
					},
					{
						'id'     : 8,
						'estatus': 'Cancelado'
					}
				],
				estatusNuevo: vm.caso.estatus.id,
				actuliza    : function () {
					var msj = '';
					
					switch (vm.cambiaEstatus.estatusNuevo) {
						case 4:
							msj = 'La tarea cambiará a <b class="font-green-jungle">Proceso</b>. Escribe tu contraseña para confirmar y presiona OK.';
							
							break;
						case 5:
							msj = '<b class="font-red-thunderbird">IMPORTANTE: </b> Si cambias el estatus del caso a <b>precierre</b> las tareas se cerrarán al 100% sin tomar encuenta si la actividad se realizó y se enviará la encuesta de satisfacción al cliente.' +
								' Si estás de acuerdo confirma escribiendo tu contraseña y presiona OK.';
							
							break;
						case 6:
							msj = '<b class="font-red-thunderbird">IMPORTANTE: </b> Si cambias el estatus del caso a <b>cerrado</b> las tareas se cerrarán al 100% sin tomar encuenta si la actividad se realizó y se dará como concluido el caso <b>sin enviar</b> encuesta de satisfacción al cliente.' +
								' Si estás de acuerdo confirma escribiendo tu contraseña y presiona OK.';
							
							break;
						case 7:
							msj = '<b class="font-red-thunderbird">IMPORTANTE: </b> Si cambias el estatus del caso a <b>suspendido</b> el caso no podrá cambiar a precierre cuando todas las tareas hayan cerrado.' +
								' Si estás de acuerdo confirma escribiendo tu contraseña y presiona OK.';
							
							break;
						case 8:
							msj = '<b class="font-red-thunderbird">IMPORTANTE: </b> Si cambias el estatus del caso a <b>cancelado</b> todas las tareas se cancelarán y no se enviará la encuesta de satisfacción al cliente.' +
								' Si estás de acuerdo confirma escribiendo tu contraseña y presiona OK.';
							break;
					}
					
					$ngBootbox.prompt(msj).then(function (result) {
						App.scrollTop();
						App.blockUI({
							target      : '#ui-view',
							message     : '<b>Cambiando estatus</b>',
							boxed       : true,
							overlayColor: App.getBrandColor('grey'),
							zIndex      : 99999
						});
						
						var data = {
							estatus : vm.cambiaEstatus.estatusNuevo,
							password: result
						};
						Caso.cambiaEstatus({id: vm.caso.id}, data).$promise.then(function (response) {
							vm.caso = response.data;
							App.unblockUI('#ui-view');
							NotifService.success('Se ha cambiado el estatus del caso correctamente.', 'Cambio de estatus correcto.');
						}, function (response) {
							App.unblockUI('#ui-view');
							vm.cambiaEstatus.estatusNuevo = vm.caso.estatus.id;
							NotifService.error('Error al cambiar el estatus del caso.', response.statusText + ' (' + response.status + ').');
						});
					}, function () {
						vm.cambiaEstatus.estatusNuevo = vm.caso.estatus.id;
					});
				}
			};
			
			vm.aceptaReasignacion = function () {
				vm.cambiaEstatus.estatusNuevo = 4;
				vm.cambiaEstatus.actuliza();
			};
			
			vm.reloadCaso = function () {
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Cargando datos del caso </b>',
					boxed       : true,
					zIndex      : 99999,
					overlayColor: App.getBrandColor('grey')
				});
				
				Caso.get({id: vm.caso.id}).$promise.then(function (response) {
					if (response.$resolved) {
						vm.caso = response.data;
						App.unblockUI('#ui-view');
					}
				}, function (response) {
					NotifService.error('Error al actualizar datos del caso, informa esto al departamento de desarrollo.', response.statusText + ' (' + response.status + ')');
					App.unblockUI('#ui-view');
				});
			};
			
			vm.estaTrabajando = false;
			vm.isWorking      = function (id) {
				firebase.database().ref('tarea-enproceso').orderByChild('idTarea').equalTo(id).on('value', function (snapshot) {
					if (snapshot.val() != null) {
						snapshot.forEach(function (childSnapshot) {
							vm.estaTrabajando = childSnapshot.val().estaTrabajando;
						});
					}
				});
				
				return vm.estaTrabajando;
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
			
			vm.editaTiempos = function (idTarea) {
				App.blockUI({
					target      : '#ui-view',
					animate     : true,
					overlayColor: App.getBrandColor('blue'),
					zIndex      : 9999
				});
				
				$uibModal.open({
					backdrop   : 'static',
					templateUrl: 'views/vista-ejecutivo/casos/modal/modalEditaTiempos.html',
					controller : 'ModalEditaTiempos as modalEditaTiempos',
					size       : 'lg',
					resolve    : {
						tarea: [
							'Tarea', function (Tarea) {
								return Tarea.get({idtarea: idTarea}).$promise
							}
						]
					}
				});
			};
			
			vm.editaNotas = function (idTarea) {
				App.blockUI({
					target      : '#ui-view',
					animate     : true,
					overlayColor: App.getBrandColor('blue'),
					zIndex      : 9999
				});
				
				$uibModal.open({
					backdrop   : 'static',
					templateUrl: 'views/vista-ejecutivo/casos/modal/modalEditaNotas.html',
					controller : 'ModalEditaNotas as modalEditaNotas',
					size       : 'lg',
					resolve    : {
						tarea: [
							'Tarea', function (Tarea) {
								return Tarea.get({idtarea: idTarea}).$promise
							}
						],
					}
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
			
			vm.modalReasgina = function (idTarea) {
				App.blockUI({
					target      : '#ui-view',
					animate     : true,
					overlayColor: App.getBrandColor('blue'),
					zIndex      : 9999
				});
				$uibModal.open({
					backdrop   : 'static',
					templateUrl: 'views/vista-ejecutivo/casos/modal/modalReasignaTarea.html',
					controller : 'ModalReasignaTarea as modalReasignaTarea',
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
			
			var cont           = $('#chats');
			var form           = $('.chat-form', cont);
			var input          = $('input', form);
			vm.usuarioActual   = authUser.getSessionData();
			var getLastPostPos = function () {
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
			
			vm.chat = {
				enviar: function () {
					var inputText = angular.element('#mensaje');
					var mensaje   = inputText.val();
					if (mensaje.length == 0) {
						return;
					}
					firebase.database().ref('caso/' + vm.caso.id + '/chat').push({
						ejecutivo: {
							id    : vm.usuarioActual.id,
							nombre: vm.usuarioActual.nombre + ' ' + vm.usuarioActual.apellido,
							rol   : 'Líder',
							color : vm.usuarioActual.ejecutivo.color,
							class : vm.usuarioActual.ejecutivo.class
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
			
			vm.mensajesChat = [];
			firebase.database().ref('caso/' + vm.caso.id + '/chat').on('value', function (snapshot) {
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
			
			$scope.$on('creadaNuevaTarea', function (e, args) {
				vm.caso = args;
			});
			
			$scope.$on('recarga-tareas', function (e, args) {
				vm.reloadTareas();
			});
			
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
				App.scrollTop();
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
	.controller('ModalEditaTiempos', [
		'$rootScope',
		'$scope',
		'$uibModalInstance',
		'tarea',
		'$ngBootbox',
		'TareaTiempos',
		'Tarea',
		'NotifService',
		'$filter',
		function ($rootScope, $scope, $uibModalInstance, tarea, $ngBootbox, TareaTiempos, Tarea, NotifService, $filter) {
			var vm   = this;
			vm.tarea = tarea.data;
			
			vm.edita = function (sesion) {
				$ngBootbox.prompt('Escribe la duración en formato 00:00:00:', $filter('duracion')(sesion.duracionSegundos, 'HH:mm:ss', 's')).then(function (result) {
					var segundos = moment.duration(result).asSeconds();
					
					if (segundos == 0) {
						NotifService.error('El formato no corresponde.', 'No se actualizó el tiempo.');
						return;
					}
					
					sesion.fechaFin         = moment(sesion.fechaInicio + segundos, 'X').format('YYYY-MM-DD HH:mm:ss');
					sesion.fechaInicio      = moment(sesion.fechaInicio, 'X').format('YYYY-MM-DD HH:mm:ss');
					sesion.duracionSegundos = segundos;
					
					App.blockUI({
						target      : '#modalEditaTiempos',
						message     : '<b> Reasignando </b>',
						boxed       : true,
						zIndex      : 99999,
						overlayColor: App.getBrandColor('grey')
					});
					
					TareaTiempos.update({idtarea: vm.tarea.id, idtiempo: sesion.id}, sesion).$promise.then(function (response) {
						if (response.$resolved) {
							App.unblockUI('#modalEditaTiempos');
							vm.reloadTarea();
						}
					}, function (response) {
						NotifService.error('Hubo un error al actualizar el tiempo.', response.statusText + ' (' + response.status + ')');
						App.unblockUI('#modalEditaTiempos');
					});
					
				});
			};
			
			vm.elimina = function (sesion) {
				
			};
			
			vm.reloadTarea = function () {
				App.blockUI({
					target      : '#modalEditaTiempos',
					message     : '<b> Actualizando. </b>',
					boxed       : true,
					zIndex      : 99999,
					overlayColor: App.getBrandColor('grey')
				});
				Tarea.get({idtarea: vm.tarea.id}).$promise.then(function (response) {
					if (response.$resolved) {
						vm.tarea = response.data;
						App.unblockUI('#modalEditaTiempos');
					}
				}, function (response) {
					NotifService.error('Error al actualizar notas, comunica esto al departamento de desarrollo.', response.statusText + '(' + response.status + ')');
					App.unblockUI('#modalEditaTiempos');
				});
			};
			
			App.unblockUI('#ui-view');
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	])
	.controller('ModalEditaNotas', [
		'$rootScope',
		'$scope',
		'$uibModalInstance',
		'tarea',
		'$ngBootbox',
		'TareaNota',
		'Tarea',
		'NotifService',
		function ($rootScope, $scope, $uibModalInstance, tarea, $ngBootbox, TareaNota, Tarea, NotifService) {
			var vm   = this;
			vm.tarea = tarea.data;
			
			vm.notas = {
				loading : false,
				progress: 0,
				lista   : vm.tarea.notas.todas,
				tipo    : 'todos',
				titulo  : 'Todos',
				filtro  : function (tipo) {
					
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
				elimina : function (nota) {
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
											vm.reloadTarea();
										}
									}, function (response) {
										App.unblockUI('#nota' + nota.id);
										NotifService.error('Error al eliminar nota, comunica esto al departamento de desarrollo.', response.statusText + ' (' + response.status + ')');
									});
								}, function (results) {
									NotifService.error('Error al borrar imagenes, comunica esto al departamento de desarrollo.', results.statusText + '(' + results.status + ')');
									App.unblockUI('#nota' + nota.id);
								});
							}
							else {
								TareaNota.delete({
									idtarea: vm.tarea.id,
									idnota : nota.id
								}).$promise.then(function (response) {
									if (response.$resolved) {
										App.unblockUI('#nota' + nota.id);
										vm.reloadTarea();
									}
								}, function (response) {
									App.unblockUI('#nota' + nota.id);
									NotifService.error('Error al eliminar nota, comunica esto al departamento de desarrollo.', response.statusText + ' (' + response.status + ')');
								});
							}
						});
				},
				edita   : function (nota) {
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
									App.unblockUI('#nota' + nota.id);
									vm.reloadTarea();
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
				cambia  : function (nota) {
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
									App.unblockUI('#nota' + nota.id);
									vm.reloadTarea();
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
			
			vm.reloadTarea = function () {
				App.blockUI({
					target      : '#modalEditaNotas',
					message     : '<b> Actualizando. </b>',
					boxed       : true,
					zIndex      : 99999,
					overlayColor: App.getBrandColor('grey')
				});
				Tarea.get({idtarea: vm.tarea.id}).$promise.then(function (response) {
					if (response.$resolved) {
						vm.tarea = response.data;
						vm.notas.filtro(vm.notas.tipo);
						App.unblockUI('#modalEditaNotas');
					}
				}, function (response) {
					NotifService.error('Error al actualizar notas, comunica esto al departamento de desarrollo.', response.statusText + '(' + response.status + ')');
					App.unblockUI('#modalEditaNotas');
				});
			};
			
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
		'Tarea',
		'NotifService',
		function ($rootScope, $scope, $uibModalInstance, tarea, ejecutivos, $ngBootbox, $timeout, Tarea, NotifService) {
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
				formulario          : null,
				caso                : vm.tarea.caso.id,
				titulo              : vm.tarea.titulo,
				descripcion         : vm.tarea.descripcion,
				fechainicio         : moment.utc(vm.tarea.fecha_inicio, 'X').toDate(),
				duracion            : moment(moment.duration(vm.tarea.duracion_tentativa_segundos, 's').asHours(), 'H').format('HH:mm'),
				duracionsegundos    : vm.tarea.duracion_tentativa_segundos,
				fechatentativacierre: moment.utc(vm.tarea.fecha_tentativa_cierre, 'X').toDate(),
				avance              : vm.tarea.avance,
				estatus             : vm.tarea.estatus.id
			};
			
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
			
			$timeout(function () {
				$scope.$broadcast('rzSliderForceRender');
			}, 1000);
			
			vm.guardar = function () {
				App.blockUI({
					target      : '#modalEditaTarea',
					message     : '<b> Actualizando </b>',
					boxed       : true,
					zIndex      : 99999,
					overlayColor: App.getBrandColor('grey')
				});
				
				vm.formTarea.fechainicio          = moment(vm.formTarea.fechainicio).format('YYYY-MM-DD HH:mm:ss');
				vm.formTarea.fechatentativacierre = moment(vm.formTarea.fechatentativacierre).format('YYYY-MM-DD HH:mm:ss');
				delete vm.formTarea.formulario;
				Tarea.update({idtarea: vm.tarea.id}, vm.formTarea).$promise.then(function (response) {
					if (response.$resolved) {
						vm.tarea = response.data;
						App.unblockUI('#modalEditaTarea');
						$uibModalInstance.dismiss('cancel');
						$rootScope.$broadcast('recarga-tareas');
						NotifService.success('Se ha editado correctamente la tarea.', 'Tarea editada.');
					}
				}, function (response) {
					if (response.status == 422) {
						if (response.data.hasOwnProperty('errors')) {
							for (var key in response.data.errors) {
								if (response.data.errors.hasOwnProperty(key)) {
									NotifService.error(response.data.errors[key][0], 'Error con los datos.');
								}
							}
							App.unblockUI('#modalEditaTarea');
							return;
						}
					}
					App.unblockUI('#modalEditaTarea');
					NotifService.error('Error al actualizar los datos de la tarea.', response.statusText + ' (' + response.status + ')');
				});
			};
			
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
			
		}
	])
	.controller('ModalReasignaTarea', [
		'$rootScope',
		'$scope',
		'$uibModalInstance',
		'tarea',
		'ejecutivos',
		'$ngBootbox',
		'$timeout',
		'Tarea',
		'NotifService',
		function ($rootScope, $scope, $uibModalInstance, tarea, ejecutivos, $ngBootbox, $timeout, Tarea, NotifService) {
			var vm = this;
			
			App.unblockUI('#ui-view');
			
			vm.tarea      = tarea.data;
			vm.ejecutivos = [];
			ejecutivos.data.forEach(function (ejecutivo, index) {
				if (ejecutivo.id != vm.tarea.ejecutivo.id) {
					vm.ejecutivos.push(ejecutivo);
				}
			});
			
			vm.form = {
				ejecutivo : null,
				motivo    : null,
				formulario: null
			};
			
			vm.guardar = function () {
				App.blockUI({
					target      : '#modalEditaTarea',
					message     : '<b> Reasignando </b>',
					boxed       : true,
					zIndex      : 99999,
					overlayColor: App.getBrandColor('grey')
				});
				
				delete vm.form.formulario;
				Tarea.reasgina({idtarea: vm.tarea.id}, vm.form).$promise.then(function (response) {
					if (response.$resolved) {
						$uibModalInstance.dismiss('cancel');
						NotifService.success('Se le ha notificado a ' + response.data.actual.nombre + ' de la reasginación.', 'Reasginada la tarea.');
						$rootScope.$broadcast('recarga-tareas');
						App.unblockUI('#modalEditaTarea');
					}
				}, function (response) {
					App.unblockUI('#modalEditaTarea');
					NotifService.error('Error al actualizar los datos de la tarea.', response.statusText + ' (' + response.status + ')');
				});
			};
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	]);
