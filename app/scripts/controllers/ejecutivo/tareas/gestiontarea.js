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
		'$rootScope', '$scope', 'dataTarea', '$uibModal', 'authUser', '$state', 'Caso', 'Tarea', 'NotifService', '$filter', 'TareaNota', 'NotaFB', '$timeout', 'Agenda',
		function ($rootScope, $scope, dataTarea, $uibModal, authUser, $state, Caso, Tarea, NotifService, $filter, TareaNota, NotaFB, $timeout, Agenda) {
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
				abreAgenda    : function () {
					$uibModal.open({
						backdrop   : 'static',
						templateUrl: 'modalVistaAgenda.html',
						controller : 'ModalVistaAgenda as modalVistaAgenda',
						resolve    : {
							dataIDTarea: vm.tarea.id
						},
						size       : 'lg'
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
				guarda         : function () {
					
					var tiempo       = vm.agenda.duracion.split(':');
					var horas        = parseInt(tiempo[0]);
					var minutos      = parseInt(tiempo[1]);
					var totalminutos = (horas * 60) + minutos;
					var end          = moment(vm.agenda.fechaInicio).add(totalminutos, 'm');
					
					var data = {
						ejecutivo: authUser.getSessionData().id,
						titulo     : vm.tarea.titulo,
						descripcion: vm.tarea.descripcion,
						start      : moment(vm.agenda.fechaInicio).format("YYYY-MM-DD HH:mm:ss"),
						end        : moment(end).format("YYYY-MM-DD HH:mm:ss"),
						referencia : 'tarea.' + vm.tarea.id
					};
					
					App.blockUI({
						target      : '#ui-view',
						message     : '<b> Añadiendo evento a mi agenda. </b>',
						boxed       : true,
						zIndex      : 99999,
						overlayColor: App.getBrandColor('grey')
					});
					
					var agenda = new Agenda(data);
					agenda.$save().then(function (response) {
						App.unblockUI('#ui-view');
						console.log(response);
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
								vm.notas.progress = $filter('number')(progress, 0);
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
		'$rootScope', '$scope', '$uibModalInstance', '$filter', '$ngBootbox', 'dataIDTarea', '$compile', 'uiCalendarConfig',
		function ($rootScope, $scope, $uibModalInstance, $filter, $ngBootbox, dataIDTarea, $compile, uiCalendarConfig) {
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
				events: [
					{
						id    : 1,
						title : 'Mi primer evento',
						start : moment(1476919200, 'X').format(),
						end   : moment(1476921600, 'X').format(),
						allDay: false,
						color : '#F2784B'
					}
				]
			};
			/* alert on eventClick */
			$scope.alertOnEventClick = function (date, jsEvent, view) {
				var options = {
					message: 'This is a message!',
					title  : date.title,
					buttons: {
						warning: {
							label    : "Cancel",
							className: "btn-warning",
							callback : function () {
							}
						},
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
				console.log(jsEvent);
				console.log(view);
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
