'use strict';
/***
 Metronic AngularJS App Main Script
 ***/

/* Metronic App */
var MetronicApp = angular.module('MetronicApp', [
	'ui.router',
	'ui.bootstrap',
	'ui.calendar',
	'ui.bootstrap.datetimepicker',
	'oc.lazyLoad',
	'ngSanitize',
	'ngResource',
	'ngAnimate',
	'ngAudio',
	'ngTagsInput',
	'ngBootbox',
	'ngFileUpload',
	'LocalStorageModule',
	'satellizer',
	'permission',
	'permission.ui',
	'datatables',
	'datatables.bootstrap',
	'ui.mask',
	'ngMask',
	'ngMap',
	'nk.touchspin',
	'rzModule',
	'toastr',
	'jcs-autoValidate',
	'angular.filter',
	'angularMoment',
	'checklist-model',
	'angular-ladda',
	'firebase',
	'timer',
	//Servicios
	'authService'
]);

/* Defino constantes */
MetronicApp.constant('CRM_APP', {
	accept     : 'application/vnd.crm.v1+json',
	contentType: 'application/json; charset=utf-8',
	url        : '//api.crm/api/'
});

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
MetronicApp.config([
	'$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
		$ocLazyLoadProvider.config({
			// global configs go here
			debug: false
		});
	}
]);

/********************************************
 BEGIN: BREAKING CHANGE in AngularJS v1.3.x:
 *********************************************/
/**
 `$controller` will no longer look for controllers on `window`.
 The old behavior of looking on `window` for controllers was originally intended
 for use in examples, demos, and toy apps. We found that allowing global controller
 functions encouraged poor practices, so we resolved to disable this behavior by
 default.
 
 To migrate, register your controllers with modules rather than exposing them
 as globals:
 
 Before:
 
 ```javascript
 function MyController() {
  // ...
}
 ```
 
 After:
 
 ```javascript
 angular.module('myApp', []).controller('MyController', [function() {
  // ...
}]);
 
 Although it's not recommended, you can re-enable the old behavior like this:
 
 ```javascript
 angular.module('myModule').config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);
 **/

//AngularJS v1.3.x workaround for old style controller declarition in HTML
MetronicApp.config([
	'$controllerProvider', function ($controllerProvider) {
		// this option might be handy for migrating old apps, but please don't use it
		// in new ones!
		$controllerProvider.allowGlobals();
	}
]);

/********************************************
 END: BREAKING CHANGE in AngularJS v1.3.x:
 *********************************************/

/* Setup global settings */
MetronicApp.factory('settings', [
	'$rootScope', function ($rootScope) {
		// supported languages
		var settings = {
			layout    : {
				pageOnLoad          : true,
				pageSidebarClosed   : false, // sidebar menu state
				pageContentWhite    : true, // set page content layout
				pageBodySolid       : false, // solid body color state
				pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
			},
			assetsPath: 'assets',
			globalPath: 'assets/global',
			layoutPath: 'assets/layouts/layout2',
		};
		
		$rootScope.settings = settings;
		
		return settings;
	}
]);

/* Setup App Main Controller */
MetronicApp.controller('AppController', [
	'$scope', '$rootScope', function ($scope, $rootScope) {
		
		$scope.$on('$viewContentLoaded', function () {
			App.initComponents(); // init core components
			//Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive
		});
	}
]);

/***
 Layout Partials.
 By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial
 initialization can be disabled and Layout.init() should be called on page load complete as explained above.
 ***/

/* Setup Layout Part - Header */
MetronicApp.controller('HeaderController', [
	'$scope',
	'$rootScope',
	'authUser',
	'NotifService',
	'Cronometro',
	'$uibModal',
	'$state',
	'$timeout',
	'TareaTiempos',
	function ($scope, $rootScope, authUser, NotifService, Cronometro, $uibModal, $state, $timeout, TareaTiempos) {
		NotifService.fbNotificacion();
		
		var vm            = this;
		vm.tareasEnMarcha = [];
		
		firebase.database().ref('tarea-enproceso').orderByChild('idEjecutivo').equalTo(authUser.getSessionData().id).on('value', function (snapshot) {
			$timeout(function () {
				if (snapshot.numChildren() != vm.tareasEnMarcha.length) {
					vm.tareasEnMarcha = [];
					snapshot.forEach(function (childSnapshot) {
						var tarea = childSnapshot.val();
						if (tarea.estaTrabajando) {
							tarea.fbID = childSnapshot.key;
							//tarea.inicio = moment().valueOf() - childSnapshot.val().duracionMilis;
							vm.tareasEnMarcha.push(tarea);
						}
					});
				}
			});
		});
		
		$scope.$on('recarga-tareas', function () {
			firebase.database().ref('tarea-enproceso').orderByChild('idEjecutivo').equalTo(authUser.getSessionData().id).once('value', function (snapshot) {
				$timeout(function () {
					vm.tareasEnMarcha = [];
					snapshot.forEach(function (childSnapshot) {
						var tarea = childSnapshot.val();
						if (tarea.estaTrabajando) {
							tarea.fbID = childSnapshot.key;
							//tarea.inicio = moment().valueOf() - childSnapshot.val().duracionMilis;
							vm.tareasEnMarcha.push(tarea);
						}
					});
				});
			});
		});
		
		$scope.$on('timer-tick', function (event, args) {
			$timeout(function () {
				var fbID = angular.element(args.timerElement).attr('fbid');
				if (fbID != undefined || fbID != null) {
					firebase.database().ref('tarea-enproceso/' + fbID).update({
						duracionMilis: Math.floor(args.millis / 1000) * 1000
					});
				}
			});
		});
		
		vm.tareasTrabajando = {
			enProceso     : false,
			abreModalTarea: function (fbID) {
				App.blockUI({
					target      : '#ui-view',
					message     : '<b>Abriendo datos de la tarea </b>',
					boxed       : true,
					zIndex      : 99999,
					overlayColor: App.getBrandColor('grey')
				});
				
				firebase.database().ref('tarea-enproceso/' + fbID).once('value', function (snapshot) {
					$uibModal.open({
						backdrop   : 'static',
						templateUrl: 'views/vista-ejecutivo/partials/modal/modalTareaProceso.html',
						controller : 'ModalTareaProcesoController as modalTareaProcesoController',
						resolve    : {
							dataTarea: [
								'$stateParams', 'Tarea', function ($stateParams, Tarea) {
									return Tarea.get({idtarea: snapshot.val().idTarea}).$promise;
								}
							]
						},
						size       : 'lg'
					});
				});
			},
			detener       : function (notificacion) {
				vm.tareasTrabajando.enProceso = true;
				$('timer#timer' + notificacion.tarea.id)[0].stop();
				firebase.database().ref('tarea-enproceso/' + notificacion.fbID).once('value').then(function (snapshot) {
					$timeout(function () {
						if (snapshot.val() != null) {
							var tarea = snapshot.val();
							var data  = {
								inicio  : moment(tarea.inicio).format('YYYY-MM-DD H:mm:ss'),
								fin     : moment().format('YYYY-MM-DD H:mm:ss'),
								duracion: tarea.duracionMilis / 1000
							};
							
							TareaTiempos.save({idtarea: notificacion.tarea.id}, data).$promise.then(function (response) {
								if (response.$resolved) {
									firebase.database().ref('tarea-enproceso/' + notificacion.fbID).update({estaTrabajando: false}).then(function () {
										firebase.database().ref('tarea-enproceso/' + notificacion.fbID).remove().then(function () {
											$timeout(function () {
												$rootScope.$broadcast('recarga-tareas');
												NotifService.success("Se ha detenido la sesión de la tarea y registrado el tiempo correctamente.", 'Se añadio nuevo registro de tiempo.');
												vm.tareasTrabajando.enProceso = false;
											});
										}, function (error) {
											console.log("Remove failed: " + error.message);
											NotifService.error("Remove failed: " + error.message, 'Error al eliminar tarea en Firebase.');
											vm.tareasTrabajando.enProceso = false;
										});
									});
								}
							}, function (response) {
								NotifService.error('Ocurrió un error en el servidor al tratar de registra la sesión de trabajo de la tarea.', response.statusText + ' (' + response.status + ').');
								vm.tareasTrabajando.enProceso = false;
							});
						}
					});
				}, function (error) {
					console.log(error);
					NotifService.error('Ocurrió un error al recuperar dato de Firebase, ponte contacto con departamento de desarrollo.', 'Error Firebase.');
				});
			},
			abreTarea     : function (tareaID) {
				$state.go('gestion-tarea', {idtarea: tareaID}, {notify: true});
			}
		};
		
		$scope.$on('$includeContentLoaded', function () {
			Layout.initHeader(); // init header
		});
		
		vm.logout = function () {
			authUser.logout();
		};
	}
]);

MetronicApp.controller('ModalTareaProcesoController', [
	'$rootScope',
	'$scope',
	'$uibModalInstance',
	'dataTarea',
	'$timeout',
	'TareaNota',
	'TareaTiempos',
	'Tarea',
	'NotifService',
	function ($rootScope, $scope, $uibModalInstance, dataTarea, $timeout, TareaNota, TareaTiempos, Tarea, NotifService) {
		App.unblockUI('#ui-view');
		var vm   = this;
		vm.tarea = dataTarea.data;
		
		firebase.database().ref('tarea-enproceso').orderByChild('idTarea').equalTo(vm.tarea.id).on('value', function (snapshot) {
			$timeout(function () {
				snapshot.forEach(function (childSnapshot) {
					vm.snapshot     = childSnapshot.val();
					vm.snapshot.key = childSnapshot.key;
				});
			});
		});
		
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
			guarda       : function () {
				vm.notas.loading = true;
				var file         = vm.notas.form.file;
				
				console.log(vm.snapshot.key);
				
				if (vm.notas.form.avance == 100) {
					App.blockUI({
						target      : '#ui-view',
						animate     : true,
						overlayColor: App.getBrandColor('grey')
					});
					
					// Detiene el tiempo
					$('timer#timer' + vm.snapshot.tarea.id)[0].stop();
					firebase.database().ref('tarea-enproceso/' + vm.snapshot.key).once('value').then(function (snapshot) {
						$timeout(function () {
							if (snapshot.val() != null) {
								var tarea = snapshot.val();
								var data  = {
									inicio  : moment(tarea.inicio).format('YYYY-MM-DD H:mm:ss'),
									fin     : moment().format('YYYY-MM-DD H:mm:ss'),
									duracion: tarea.duracionMilis / 1000
								};
								
								TareaTiempos.save({idtarea: vm.snapshot.tarea.id}, data).$promise.then(function (response) {
									if (response.$resolved) {
										firebase.database().ref('tarea-enproceso/' + vm.snapshot.key).update({estaTrabajando: false}).then(function () {
											firebase.database().ref('tarea-enproceso/' + vm.snapshot.key).remove().then(function () {
												$timeout(function () {
													$rootScope.$broadcast('recarga-tareas');
													NotifService.success("Se ha detenido la sesión de la tarea y registrado el tiempo correctamente.", 'Se añadio nuevo registro de tiempo.');
													App.unblockUI('#ui-view');
												});
											}, function (error) {
												console.log("Remove failed: " + error.message);
												NotifService.error("Remove failed: " + error.message, 'Error al eliminar tarea en Firebase.');
												App.unblockUI('#ui-view');
											});
										});
									}
								}, function (response) {
									App.unblockUI('#ui-view');
									NotifService.error('Ocurrió un error en el servidor al tratar de registra la sesión de trabajo de la tarea.', response.statusText + ' (' + response.status + ').');
								});
							}
						});
					}, function (error) {
						console.log(error);
						App.unblockUI('#ui-view');
						NotifService.error('Ocurrió un error al recuperar dato de Firebase, ponte contacto con departamento de desarrollo.', 'Error Firebase.');
					});
				}
				
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
						App.unblockUI('#ui-view');
					});
				}
				
				$uibModalInstance.dismiss('cancel');
			}
		};
		
		vm.avisos = {
			tienFechaCierre: function () {
				return vm.tarea.fecha_tentativa_cierre != null;
			},
			terminoCaso    : function () {
				return vm.caso.fecha_tentativa_precierre <= moment().unix();
			},
			defineFecha    : function () {
				return vm.tarea.fecha_inicio == null || vm.tarea.fecha_tentativa_cierre == null || vm.tarea.duracion_minutos == 0;
			},
			atrasoCaso     : function () {
				return vm.caso.fecha_tentativa_precierre < moment().unix() && vm.tarea.estatus.id == 3;
			},
			atrasoTarea    : function () {
				return vm.tarea.fecha_tentativa_cierre < moment().unix() && vm.avisos.tienFechaCierre();
			},
			excesoTiempo   : function () {
				return vm.tarea.duracion_real_segundos > vm.tarea.duracion_tentativa_segundos;
			},
			ultimaTarea    : function () {
				angular.forEach(vm.caso.tareas, function (tarea, index) {
					if (tarea.avance != 100 && tarea.id != vm.tarea.id) {
						return false;
					}
				});
				return vm.avisos.tienFechaCierre();
			}
		};
		
		vm.cancel = function () {
			$uibModalInstance.dismiss('cancel');
		};
		
		vm.reloadCaso = function () {
			
			App.blockUI({
				target      : '#ui-view',
				animate     : true,
				overlayColor: App.getBrandColor('grey')
			});
			
			Tarea.get({idtarea: vm.tarea.id}).$promise.then(function (response) {
				if (response.$resolved) {
					vm.tarea                        = response.data;
					vm.notas.form.avance            = vm.tarea.avance;
					vm.notas.sliderOptions.minLimit = vm.tarea.avance;
					
					$timeout(function () {
						$scope.$broadcast('rzSliderForceRender');
					});
					
					App.unblockUI('#ui-view');
				}
			});
		};
		
		$timeout(function () {
			$scope.$broadcast('rzSliderForceRender');
		});
	}
]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', [
	'$scope', 'CotizacionFB', 'authUser', function ($scope, CotizacionFB, authUser) {
		var vm = this;
		
		vm.casos = {
			casosxasignar: 0
		};
		
		vm.cotizacion = {
			pagosxrevisar: 0
		};
		
		//Casos por asignar
		firebase.database().ref('caso').orderByChild('estatus').equalTo('porasignar').on('value', function (snapshot) {
			vm.casos.casosxasignar = snapshot.numChildren();
		});
		
		//Mis Casos
		firebase.database().ref('caso').orderByChild('idLider').equalTo(authUser.getSessionData().id).on('value', function (snapshot) {
			vm.casos.miscasos = snapshot.numChildren();
		});
		
		//Cotizaciones por revisar
		firebase.database().ref('cotizacion').orderByChild('estatus').equalTo('revision').on('value', function (snapshot) {
			vm.cotizacion.pagosxrevisar = snapshot.numChildren();
		});
		
		$scope.$on('$includeContentLoaded', function () {
			Layout.initSidebar(); // init sidebar
			
			vm.totalCasosPorAsignar  = 0;
			var totalCasosPorAsignar = CotizacionFB.array();
			totalCasosPorAsignar.$loaded().then(function () {
				vm.totalCasosPorAsignar = totalCasosPorAsignar.length;
			});
		});
	}
]);

/* Setup Layout Part - Quick Sidebar */
MetronicApp.controller('QuickSidebarController', [
	'$scope', function ($scope) {
		$scope.$on('$includeContentLoaded', function () {
			setTimeout(function () {
				QuickSidebar.init(); // init quick sidebar
			}, 2000);
		});
	}
]);

/* Setup Layout Part - Theme Panel */
MetronicApp.controller('ThemePanelController', [
	'$scope', function ($scope) {
		$scope.$on('$includeContentLoaded', function () {
			Demo.init(); // init theme panel
		});
	}
]);

/* Setup Layout Part - Footer */
MetronicApp.controller('FooterController', [
	'$scope', function ($scope) {
		$scope.$on('$includeContentLoaded', function () {
			Layout.initFooter(); // init footer
		});
	}
]);

/* Interceptor para las peticiones */
MetronicApp.factory('interceptor', [
	'$injector', '$q', 'CRM_APP',
	function ($injector, $q, CRM_APP) {
		return {
			request: function (config) {
				config.headers['Accept']       = CRM_APP.accept;
				config.headers['Content-Type'] = CRM_APP.contentType;
				return config;
			},
			
			requestError: function (config) {
				return config;
			},
			
			response: function (response) {
				return response;
			},
			
			responseError: function (response) {
				var $state = $injector.get('$state');
				var Logger = $injector.get('Logger');
				
				console.error(response.data.message);
				
				if (response.status != 401 && response.status != 422) {
					Logger.save({
						message   : response.data.message,
						statusText: response.statusText,
						status    : response.status,
						tipo      : 'error'
					});
				}
				
				if (response.status == 401) {
					console.log(response);
					if (response.data.hasOwnProperty('error') && response.data.error == "token_expired") {
						alert('Token expirado, reinicia sesión.');
						location.reload(true);
					}
				}
				
				return $q.reject(response);
			}
		}
	}
]);

/* Setup Rounting For All Pages */
MetronicApp.config([
	'$stateProvider', '$urlRouterProvider', '$authProvider', '$httpProvider', 'toastrConfig', 'CRM_APP',
	function ($stateProvider, $urlRouterProvider, $authProvider, $httpProvider, toastrConfig, CRM_APP) {
		
		$httpProvider.interceptors.push('interceptor');
		$httpProvider.defaults.useXDomain = true;
		
		//$authProvider.loginUrl    = 'http://api.crm/api/auth';
		$authProvider.signupUrl       = CRM_APP.url + 'auth';
		$authProvider.tokenName       = 'token';
		$authProvider.tokenPrefix     = 'crm';
		$authProvider.httpInterceptor = function () {
			return false;
		};
		$authProvider.withCredentials = false;
		
		// Redirect any unmatched url
		$urlRouterProvider.otherwise(function ($injector) {
			var $state = $injector.get('$state');
			$state.go('dashboard');
		});
		
		$stateProvider
		// Login
			.state('login', {
				url        : '/login',
				templateUrl: 'views/login.html',
				data       : {
					pageTitle: 'Bienvenido',
					bodyClass: 'login'
				},
				controller : 'LoginCtrl as login',
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load([
								{
									name        : 'LoginCss',
									insertBefore: '#ng_load_plugins_css',
									files       : [
										'bower_components/select2/dist/css/select2.min.css',
										'bower_components/select2-bootstrap-css/select2-bootstrap.min.css'
									],
									serie       : true
								},
								{
									name        : 'LoginJs',
									insertBefore: '#ng_load_plugins_js',
									files       : [
										'bower_components/jquery-validation/dist/jquery.validate.min.js',
										'bower_components/jquery-validation/dist/additional-methods.min.js',
										'bower_components/select2/dist/js/select2.full.min.js',
										'bower_components/jquery-backstretch/src/jquery.backstretch.js',
									]
								},
								{
									name        : 'LoginNG',
									insertBefore: '#ng_load_plugins_ng',
									files       : [
										'scripts/controllers/login.js',
										'assets/pages/scripts/login-5.min.js'
									]
								}
							]);
						}
					]
				}
			})
			// Template
			.state('tmpl', {
				templateUrl: 'views/tmpl.html',
				data       : {
					requiredLogin: true,
					bodyClass    : 'page-header-fixed page-sidebar-closed-hide-logo page-container-bg-solid page-sidebar-closed-hide-logo'
				},
				abstract   : true
			})
			// Template Cliente
			.state('tmpl_cliente', {
				templateUrl: 'views/tmpl_client.html',
				data       : {
					requiredLogin: true,
					bodyClass    : 'page-header-fixed page-sidebar-closed-hide-logo page-container-bg-solid page-sidebar-closed-hide-logo'
				},
				abstract   : true
			})
			
			/**
			 * Vistas del CRM
			 */
			
			// Dashboard
			.state('dashboard', {
				url        : '/dashboard',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/inicio/dashboard.html',
				data       : {
					pageTitle: 'Bienvenido'
				},
				controller : 'DashboardController as dashboardCtrl',
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load({
								name        : 'MetronicApp',
								insertBefore: '#ng_load_plugins_ng',
								files       : [
									'scripts/controllers/ejecutivo/DashboardController.js'
								]
							});
						}
					]
				}
			})
			// Clientes
			.state('clientes', {
				url        : '/clientes',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/clientes/gestion_clientes.html',
				data       : {
					pageTitle: 'Clientes'
				},
				controller : 'GestionClientesCtrl as gestionClientesCtrl',
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load({
								name        : 'MetronicApp',
								insertBefore: '#ng_load_plugins_ng',
								files       : [
									'scripts/controllers/ejecutivo/clientes/gestionclientes.js'
								]
							});
						}
					]
				}
			})
			.state('cliente/nuevo', {
				url        : '/cliente/nuevo',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/clientes/form_cliente.html',
				data       : {
					pageTitle: 'Nuevo Cliente'
				},
				controller : 'NuevoClienteCtrl as nuevoClienteCtrl',
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load({
								name        : 'MetronicApp',
								insertBefore: '#ng_load_plugins_ng',
								files       : [
									'scripts/controllers/ejecutivo/clientes/nuevocliente.js'
								]
							});
						}
					]
				}
			})
			.state('cliente-perfil', {
				url        : '/cliente/:idcliente',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/clientes/perfil_cliente.html',
				data       : {
					pageTitle: 'Clientes'
				},
				controller : 'PerfilClienteCtrl as perfilClienteCtrl',
				resolve    : {
					deps       : [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load([
								{
									name        : 'PerfilClienteCss',
									insertBefore: '#ng_load_plugins_css',
									files       : [
										'../assets/pages/css/profile.min.css'
									],
									serie       : true
								},
							]);
						}
					],
					dataCliente: [
						'$stateParams', 'Cliente', function ($stateParams, Cliente) {
							return Cliente.get({id: $stateParams.idcliente}).$promise;
						}
					]
				}
			})
			//Casos
			.state('casos', {
				url        : '/casos',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/casos/registro_casos.html',
				data       : {
					pageTitle: 'Gestión de Casos'
				},
				controller : 'GestionCasosCtrl as gestionCasosCtrl',
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load({
								name        : 'MetronicApp',
								insertBefore: '#ng_load_plugins_ng',
								files       : [
									'scripts/controllers/ejecutivo/casos/gestioncasos.js'
								]
							});
						}
					]
				}
			})
			.state('mis-casos', {
				url        : '/mis-casos',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/casos/mis_casos.html',
				data       : {
					pageTitle: 'Mis Casos'
				},
				controller : 'MisCasosCtrl as misCasosCtrl',
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load({
								name        : 'MetronicApp',
								insertBefore: '#ng_load_plugins_ng',
								files       : [
									'scripts/controllers/ejecutivo/casos/miscasos.js'
								]
							});
						}
					]
				}
			})
			.state('casos/por-asignar', {
				url        : '/casos/por-asiginar',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/casos/casos_porasignar.html',
				data       : {
					pageTitle: 'Casos por asignar'
				},
				controller : 'CasosPorAsignarCtrl as casosPorAsignarCtrl',
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load({
								name        : 'MetronicApp',
								insertBefore: '#ng_load_plugins_ng',
								files       : [
									'scripts/controllers/ejecutivo/casos/casosporasignar.js'
								]
							});
						}
					]
				}
			})
			.state('caso', {
				url        : '/caso/:idcaso',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/casos/gestion_caso.html',
				data       : {
					pageTitle: 'Detalles de caso'
				},
				controller : 'GestionCasosCtrl as gestionCasosCtrl',
				resolve    : {
					deps    : [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load([
								{
									name        : 'MetronicAppCss',
									insertBefore: '#ng_load_plugins_css',
									files       : [
										'assets/apps/css/todo-2.css',
									],
									serie       : true
								},
								{
									name        : 'MetronicApp',
									insertBefore: '#ng_load_plugins_ng',
									files       : [
										'scripts/controllers/ejecutivo/casos/gestioncasos.js'
									]
								},
								{
									name        : 'MetronicAppCss',
									insertBefore: '#ng_load_plugins_js',
									files       : [
										'assets/apps/scripts/todo-2.min.js',
									],
									serie       : true
								}
							]);
						}
					],
					dataCaso: [
						'$stateParams', 'Caso', function ($stateParams, Caso) {
							return Caso.get({id: $stateParams.idcaso}).$promise;
						}
					]
				}
			})
			// Tarea
			.state('mis-tareas', {
				url        : '/mis-tareas',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/tareas/mis_tareas.html',
				data       : {
					pageTitle: 'Mis Tareas'
				},
				controller : 'MisTareasCtrl as misTareasCtrl',
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load([
								{
									name        : 'MetronicApp',
									insertBefore: '#ng_load_plugins_ng',
									files       : [
										'scripts/controllers/ejecutivo/tareas/mistareas.js'
									]
								}
							]);
						}
					],
				}
			})
			.state('tareas', {
				url        : '/tareas',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/tareas/tareas_gestion.html',
				data       : {
					pageTitle: 'Gestión de tareas'
				},
				controller : 'GestionTareasCtrl as gestionTareasCtrl',
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load([
								{
									name        : 'MetronicApp',
									insertBefore: '#ng_load_plugins_ng',
									files       : [
										'scripts/controllers/ejecutivo/tareas/gestiontareas.js'
									]
								}
							]);
						}
					],
				}
			})
			.state('gestion-tarea', {
				url        : '/gestion-tarea/:idtarea',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/tareas/tarea_gestion.html',
				data       : {
					pageTitle: 'Gestión de tarea'
				},
				controller : 'GestionTareaCtrl as gestionTareaCtrl',
				resolve    : {
					deps     : [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load([
								{
									name        : 'MetronicApp',
									insertBefore: '#ng_load_plugins_ng',
									files       : [
										'scripts/controllers/ejecutivo/tareas/gestiontarea.js'
									]
								}
							]);
						}
					],
					dataTarea: [
						'$stateParams', 'Tarea', function ($stateParams, Tarea) {
							return Tarea.get({idtarea: $stateParams.idtarea}).$promise;
						}
					]
				}
			})
			// Cotizaciones
			.state('cotizaciones', {
				url        : '/cotizaciones',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/cotizaciones/cotizaciones.html',
				data       : {
					pageTitle: 'Cotizaciones'
				}
			})
			.state('cotizacion/nuevo', {
				url        : '/cotizacion/nuevo',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/cotizaciones/nueva_cotizacion.html',
				data       : {
					pageTitle: 'Nueva Cotización'
				},
				controller : 'NuevaCotizacionCtrl as nuevaCotizacionCtrl',
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load([
								{
									name        : 'MetronicApp',
									insertBefore: '#ng_load_plugins_css',
									files       : [
										'../assets/pages/css/invoice-2.min.css'
									],
									serie       : true
								},
								{
									name        : 'MetronicApp',
									insertBefore: '#ng_load_plugins_ng',
									files       : [
										'scripts/controllers/ejecutivo/cotizacion/nuevacotizacion.js'
									]
								}
							]);
						}
					]
				}
			})
			.state('cotizaciones/pagos-revisar', {
				url        : '/cotizaciones/pagos-revisar',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/cotizaciones/pagos_revisar.html',
				data       : {
					pageTitle: 'Pagos por revisar'
				},
				controller : 'RevisionPagosCtrl as revisionPagosCtrl',
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load({
								name        : 'MetronicApp',
								insertBefore: '#ng_load_plugins_ng',
								files       : [
									'scripts/controllers/ejecutivo/cotizacion/revisionpagos.js'
								]
							});
						}
					]
				}
			})
			//Ejecutivos
			.state('ejecutivos', {
				url        : '/ejecutivos',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/ejecutivos/ejecutivos.html',
				data       : {
					pageTitle: 'Ejecutivos'
				},
				controller : 'EjecutivosCtrl',
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load({
								name        : 'EjecutivosNG',
								insertBefore: '#ng_load_plugins_ng',
								files       : [
									'scripts/controllers/ejecutivo/ejecutivos.js'
								],
								serie       : true
							});
						}
					]
				}
			})
			.state('ejecutivo/nuevo', {
				url        : '/ejecutivo/nuevo',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/ejecutivos/nuevo_ejecutivo.html',
				data       : {
					pageTitle: 'Nuevo ejecutivo'
				}
			})
			// Eventos
			.state('eventos', {
				url        : '/eventos',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/eventos/gestion_eventos.html',
				data       : {
					pageTitle: 'Eventos'
				}
			})
			.state('evento/nuevo', {
				url        : '/evento/nuevo',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/eventos/nuevo_evento.html',
				data       : {
					pageTitle: 'Nuevo evento'
				}
			})
			// Productos
			.state('productos', {
				url        : '/productos',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/productos/gestion_productos.html',
				data       : {
					pageTitle: 'Productos'
				},
				controller : 'GestionProductosCtrl as gestionProductosCtrl',
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load([
								{
									name        : 'ProductosNG',
									insertBefore: '#ng_load_plugins_ng',
									files       : [
										'scripts/controllers/ejecutivo/productos/gestionproductos.js'
									]
								}
							]);
						}
					]
				}
			})
			//Gestor general
			.state('oficinas', {
				url        : '/gestion/oficinas',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/gestor_general/oficinas.html',
				data       : {
					pageTitle: 'Oficinas'
				},
				controller : 'OficinasCtrl as oficinaCtrl',
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load([
								{
									name        : 'OficinasNG',
									insertBefore: '#ng_load_plugins_ng',
									files       : [
										'scripts/controllers/ejecutivo/gestor_general/oficinas.js'
									]
								}
							]);
						}
					]
				}
			})
			.state('departamentos', {
				url        : '/gestion/departamentos',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/gestor_general/departamentos.html',
				data       : {
					pageTitle: 'Departamentos'
				},
				controller : 'DepartamentosCtrl as departamentosCtrl',
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load([
								{
									name        : 'DepartamentosNG',
									insertBefore: '#ng_load_plugins_ng',
									files       : [
										'scripts/controllers/ejecutivo/gestor_general/departamentos.js',
									],
									serie       : true
								}
							]);
						}
					]
				}
			})
			.state('sistemas-contpaqi', {
				url        : '/gestion/sistemas-contpaqi',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/gestor_general/sistemas-contpaqi.html',
				data       : {
					pageTitle: 'Sistemas ContPAQi'
				}
			})
			.state('sistemas-operativos', {
				url        : '/gestion/sistemas-operativos',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/gestor_general/sistemas-operativos.html',
				data       : {
					pageTitle: 'Sistemas Operativos'
				}
			})
			.state('cuentas-bancarias', {
				url        : '/gestion/cuentas-bancarias',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/gestor_general/cuentas-bancarias.html',
				data       : {
					pageTitle: 'Cuentas Bancarias'
				}
			})
			.state('observaciones-pago', {
				url        : '/gestion/observaciones-pago',
				parent     : 'tmpl',
				templateUrl: 'views/vista-ejecutivo/gestor_general/obervaciones-pago.html',
				data       : {
					pageTitle: 'Obervaciones de pago'
				}
			})
			
			/**
			 * Vistas del cliente
			 */
			// Panel Cliente
			.state('panel-cliente', {
				url        : '/panel-cliente',
				parent     : 'tmpl',
				templateUrl: 'views/vista-cliente/inicio/dashboard.html',
				data       : {
					pageTitle: 'Bienvenido'
				},
				controller : 'DashboardCtrl as dashboardCtrl',
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load({
								name        : 'MetronicApp',
								insertBefore: '#ng_load_plugins_ng',
								files       : [
									'scripts/controllers/cliente/inicio/dashboard.js'
								]
							});
						}
					]
				}
			});
		
		angular.extend(toastrConfig, {
			allowHtml      : true,
			closeButton    : true,
			extendedTimeOut: 1500,
			iconClasses    : {
				error  : 'toast-error',
				info   : 'toast-info',
				success: 'toast-success',
				warning: 'toast-warning'
			},
			messageClass   : 'toast-message',
			onHidden       : null,
			onShown        : null,
			onTap          : null,
			progressBar    : true,
			tapToDismiss   : true,
			timeOut        : 7000,
			titleClass     : 'toast-title',
			toastClass     : 'toast'
		});
	}
]);

/* Init global settings and run the app */
MetronicApp.run([
	'$rootScope',
	'settings',
	'$state',
	'$auth',
	'$location',
	'authUser',
	'validator',
	'defaultErrorMessageResolver',
	'amMoment',
	'PermPermissionStore',
	'PermRoleStore',
	'NotifService',
	function ($rootScope, settings, $state, $auth, $location, authUser, validator, defaultErrorMessageResolver, amMoment, PermPermissionStore, PermRoleStore, NotifService) {
		
		$rootScope.$state    = $state; // state to be accessed from view
		$rootScope.$settings = settings; // state to be accessed from view
		
		//validator.setValidElementStyling(false);
		defaultErrorMessageResolver.setI18nFileRootPath('bower_components/angular-auto-validate/dist/lang/');
		defaultErrorMessageResolver.setCulture('es-CO');
		
		amMoment.changeLocale('es');
		
		var sesionData = authUser.getSessionData();
		var permisos   = [];
		
		if (sesionData != null) {
			angular.forEach(sesionData.roles, function (value, key) {
				angular.forEach(sesionData.roles[key].permisos, function (pValue, pKey) {
					permisos[pKey] = pValue.nombre;
					PermPermissionStore.definePermission(pValue.nombre, function () {
						return true;
					});
				});
				PermRoleStore.defineRole(value.nombre, permisos);
			});
		}
		
		$rootScope.$on('$stateChangeStart', function (event, toState) {
			var requiredLogin = false;
			// check if this state need login
			if (toState.data && toState.data.requiredLogin) {
				requiredLogin = true;
			}
			
			// if yes and if this user is not logged in, redirect him to login page
			if (requiredLogin && !$auth.isAuthenticated()) {
				event.preventDefault();
				$state.go('login');
			}
			else {
				$rootScope.ejecutivo = authUser.getSessionData();
				$rootScope.vista     = {};
			}
		});
	}
]);