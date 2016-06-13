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
	//Servicios
	'authService'
]);

/* Defino constantes */
MetronicApp.constant('CRM_APP', {
	url: '//api.dev/api/'
});

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
MetronicApp.config([
	'$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
		$ocLazyLoadProvider.config({
			// global configs go here
			debug: true
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

MetronicApp.factory('Interceptor', function () {
	return {
		request: function (config) {
			console.log('Envio peticion de interceptor');
			return config;
		},

		requestError: function (config) {
			return config;
		},

		response: function (res) {
			return res;
		},

		responseError: function (res) {
			return res;
		}
	}
});

/* Setup Rounting For All Pages */
MetronicApp.config([
	'$stateProvider', '$urlRouterProvider', '$authProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $authProvider, $httpProvider) {

		$httpProvider.interceptors.push('Interceptor');

// 		$httpProvider.defaults.headers.post['Accept']      = 'application/vnd.crm.v1+json';
// 		$httpProvider.defaults.headers.put['Content-Type'] = 'application/json; charset=utf-8';
// 		$httpProvider.defaults.useXDomain                  = true;
		
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
				templateUrl: 'views/dashboard.html',
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
									name        : 'OficinasCss',
									insertBefore: '#ng_load_plugins_css',
									files       : [
										'assets/global/plugins/datatables/datatables.min.css',
										'assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css'
									],
									serie       : true
								},
								{
									name        : 'OficinasNG',
									insertBefore: '#ng_load_plugins_ng',
									files       : [
										'scripts/controllers/gestor_general/oficinas.js',
									]
								}
							]);
						}
					]
				}
			})
			//Departamentos
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
			});
	}
]);

/* Init global settings and run the app */
MetronicApp.run([
	'$rootScope', 'settings', '$state', '$auth', '$location', 'authUser', 'PermissionStore', 'RoleStore', 'validator', 'defaultErrorMessageResolver',
	function ($rootScope, settings, $state, $auth, $location, authUser, PermissionStore, RoleStore, validator, defaultErrorMessageResolver) {
		
		$rootScope.$state    = $state; // state to be accessed from view
		$rootScope.$settings = settings; // state to be accessed from view

		//validator.setValidElementStyling(false);
		defaultErrorMessageResolver.setI18nFileRootPath('bower_components/angular-auto-validate/dist/lang/');
		defaultErrorMessageResolver.setCulture('es-CO');

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
		
		RoleStore.defineRole('USER', ['seeDashboard']);
	}
]);