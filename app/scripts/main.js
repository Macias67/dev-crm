'use strict';
/***
 Metronic AngularJS App Main Script
 ***/

/* Metronic App */
var MetronicApp = angular.module('MetronicApp', [
	'ui.router',
	'ui.bootstrap',
	'oc.lazyLoad',
	'ngSanitize',
	'ngResource',
	'ngAnimate',
	'ngTagsInput',
	'ngBootbox',
	'LocalStorageModule',
	'satellizer',
	'permission',
	'permission.ui',
	'datatables',
	'datatables.bootstrap',
	'ui.mask',
	'ngMap',
	'toastr',
	'jcs-autoValidate',
	'angular.filter',
	'angularMoment',
	'checklist-model',
	'firebase',
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
	'$scope', 'authUser', function ($scope, authUser) {
		var vm = this;
		$scope.$on('$includeContentLoaded', function () {
			Layout.initHeader(); // init header
		});
		
		vm.logout = function () {
			authUser.logout();
		};
	}
]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', [
	'$scope', function ($scope) {
		$scope.$on('$includeContentLoaded', function () {
			Layout.initSidebar(); // init sidebar
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
MetronicApp.service('interceptor', [
	'$injector',
	function ($injector) {
		return {
			request: function (config) {
				config.headers['Accept']       = 'application/vnd.crm.v1+json';
				config.headers['Content-Type'] = 'application/json; charset=utf-8';
				return config;
			},
			
			requestError: function (config) {
				return config;
			},
			
			response: function (res) {
				return res;
			},
			
			responseError: function (response) {
				var toastr = $injector.get('toastr');
				var $state = $injector.get('$state');
				
				if (response.status == 500) {
					toastr.error('Hubo error con el servidor', response.statusText);
					console.error(response.data.mesasge);
				}

// 				var toastr = $injector.get('toastr');
// 				var $state = $injector.get('$state');
// 				toastr.error(response.data.message, 'Error ' + response.data.status_code);
// 				$state.go('dashboard');

// 				if (response.hasOwnProperty('error') && response.error == "token_expired") {
//
//
// 					console.log('Entro a la validación de token_expired');
//
// 					toastr.error('El token de sesión ha expirado, inicia de nuevo sesión.', 'La sesión ha expirado.');
// 					$state.go('login');
// 				}
// 				return response;
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
		$authProvider.signupUrl       = 'http://api.crm/api/auth';
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
			// Dashboard
			.state('dashboard', {
				url        : '/dashboard',
				parent     : 'tmpl',
				templateUrl: 'views/inicio/dashboard.html',
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
									'scripts/controllers/DashboardController.js'
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
				templateUrl: 'views/clientes/gestion_clientes.html',
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
									'scripts/controllers/clientes/gestionclientes.js'
								]
							});
						}
					]
				}
			})
			.state('cliente/nuevo', {
				url        : '/cliente/nuevo',
				parent     : 'tmpl',
				templateUrl: 'views/clientes/form_cliente.html',
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
									'scripts/controllers/clientes/nuevocliente.js'
								]
							});
						}
					]
				}
			})
			.state('cliente-perfil', {
				url        : '/cliente/:idcliente',
				parent     : 'tmpl',
				templateUrl: 'views/clientes/perfil_cliente.html',
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
			.state('casos/por-asignar', {
				url        : '/casos/por-asiginar',
				parent     : 'tmpl',
				templateUrl: 'views/casos/casos_porasignar.html',
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
									'scripts/controllers/casos/casosporasignar.js'
								]
							});
						}
					]
				}
			})
			// Cotizaciones
			.state('cotizaciones', {
				url        : '/cotizaciones',
				parent     : 'tmpl',
				templateUrl: 'views/cotizaciones/cotizaciones.html',
				data       : {
					pageTitle: 'Cotizaciones'
				}
			})
			.state('cotizacion/nuevo', {
				url        : '/cotizacion/nuevo',
				parent     : 'tmpl',
				templateUrl: 'views/cotizaciones/nueva_cotizacion.html',
				data       : {
					pageTitle: 'Nueva Cotización'
				},
				controller : 'NuevaCotizacionCtrl as nuevaCotizacionCtrl',
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load({
								name        : 'MetronicApp',
								insertBefore: '#ng_load_plugins_ng',
								files       : [
									'scripts/controllers/cotizacion/nuevacotizacion.js'
								]
							});
						}
					]
				}
			})
			.state('cotizaciones/pagos-revisar', {
				url        : '/cotizaciones/pagos-revisar',
				parent     : 'tmpl',
				templateUrl: 'views/cotizaciones/pagos_revisar.html',
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
									'scripts/controllers/cotizacion/revisionpagos.js'
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
				templateUrl: 'views/ejecutivos/ejecutivos.html',
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
									'scripts/controllers/ejecutivos.js'
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
				templateUrl: 'views/ejecutivos/nuevo_ejecutivo.html',
				data       : {
					pageTitle: 'Nuevo ejecutivo'
				}
			})
			// Eventos
			.state('eventos', {
				url        : '/eventos',
				parent     : 'tmpl',
				templateUrl: 'views/eventos/gestion_eventos.html',
				data       : {
					pageTitle: 'Eventos'
				}
			})
			.state('evento/nuevo', {
				url        : '/evento/nuevo',
				parent     : 'tmpl',
				templateUrl: 'views/eventos/nuevo_evento.html',
				data       : {
					pageTitle: 'Nuevo evento'
				}
			})
			// Productos
			.state('productos', {
				url        : '/productos',
				parent     : 'tmpl',
				templateUrl: 'views/productos/gestion_productos.html',
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
										'scripts/controllers/productos/gestionproductos.js'
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
				templateUrl: 'views/gestor_general/oficinas.html',
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
										'scripts/controllers/gestor_general/oficinas.js'
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
				templateUrl: 'views/gestor_general/departamentos.html',
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
										'scripts/controllers/gestor_general/departamentos.js',
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
				templateUrl: 'views/gestor_general/sistemas-contpaqi.html',
				data       : {
					pageTitle: 'Sistemas ContPAQi'
				}
			})
			.state('sistemas-operativos', {
				url        : '/gestion/sistemas-operativos',
				parent     : 'tmpl',
				templateUrl: 'views/gestor_general/sistemas-operativos.html',
				data       : {
					pageTitle: 'Sistemas Operativos'
				}
			})
			.state('cuentas-bancarias', {
				url        : '/gestion/cuentas-bancarias',
				parent     : 'tmpl',
				templateUrl: 'views/gestor_general/cuentas-bancarias.html',
				data       : {
					pageTitle: 'Cuentas Bancarias'
				}
			})
			.state('observaciones-pago', {
				url        : '/gestion/observaciones-pago',
				parent     : 'tmpl',
				templateUrl: 'views/gestor_general/obervaciones-pago.html',
				data       : {
					pageTitle: 'Obervaciones de pago'
				}
			});
		
		angular.extend(toastrConfig, {
			allowHtml      : true,
			closeButton    : true,
			extendedTimeOut: 1000,
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
			timeOut        : 5000,
			titleClass     : 'toast-title',
			toastClass     : 'toast'
		});
	}
]);

/* Init global settings and run the app */
MetronicApp.run([
	'$rootScope', 'settings', '$state', '$auth', '$location', 'authUser', 'PermissionStore', 'RoleStore', 'validator', 'defaultErrorMessageResolver', 'amMoment',
	function ($rootScope, settings, $state, $auth, $location, authUser, PermissionStore, RoleStore, validator, defaultErrorMessageResolver, amMoment) {
		
		$rootScope.$state    = $state; // state to be accessed from view
		$rootScope.$settings = settings; // state to be accessed from view
		
		//validator.setValidElementStyling(false);
		defaultErrorMessageResolver.setI18nFileRootPath('bower_components/angular-auto-validate/dist/lang/');
		defaultErrorMessageResolver.setCulture('es-CO');
		
		amMoment.changeLocale('es');
		
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
		
		PermissionStore.definePermission('seeDashboard', function () {
			return true;
		});
		
		RoleStore.defineRole('ADMIN', ['seeDashboard']);
	}
]);