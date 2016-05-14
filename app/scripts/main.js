/***
 Metronic AngularJS App Main Script
 ***/

/* Metronic App */
var MetronicApp = angular.module("MetronicApp", [
	"ui.router",
	"ui.bootstrap",
	"oc.lazyLoad",
	"ngSanitize"
]);

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
	'$scope', function ($scope) {
		$scope.$on('$includeContentLoaded', function () {
			Layout.initHeader(); // init header
		});
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
			}, 2000)
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

/* Setup Rounting For All Pages */
MetronicApp.config([
	'$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
		// Redirect any unmatched url
		$urlRouterProvider.otherwise("/dashboard.html");

		$stateProvider

			// Dashboard
			.state('dashboard', {
				url        : "/dashboard.html",
				templateUrl: "views/dashboard.html",
				data       : {pageTitle: 'Admin Dashboard Template'},
				controller : "DashboardController",
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load({
								name        : 'MetronicApp',
								insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
								files       : [
									'bower_components/morris.js/morris.css',
									'bower_components/morris.js/morris.min.js',
									'bower_components/raphael/raphael.min.js',
									'bower_components/jquery-sparkline/dist/jquery.sparkline.min.js',

									'scripts/scripts/dashboard.min.js',
									'scripts/controllers/DashboardController.js',
								]
							});
						}
					]
				}
			})

			// AngularJS plugins
			.state('fileupload', {
				url        : "/file_upload.html",
				templateUrl: "views/file_upload.html",
				data       : {pageTitle: 'AngularJS File Upload'},
				controller : "GeneralPageController",
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load([
								{
									name : 'angularFileUpload',
									files: [
										'bower_components/angular-file-upload/dist/angular-file-upload.min.js',
									]
								}, {
									name : 'MetronicApp',
									files: [
										'scripts/controllers/GeneralPageController.js'
									]
								}
							]);
						}
					]
				}
			})

			// UI Select
			.state('uiselect', {
				url        : "/ui_select.html",
				templateUrl: "views/ui_select.html",
				data       : {pageTitle: 'AngularJS Ui Select'},
				controller : "UISelectController",
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load([
								{
									name        : 'ui.select',
									insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
									files       : [
										'bower_components/ui-select/dist/select.min.css',
										'bower_components/ui-select/dist/select.min.js'
									]
								}, {
									name : 'MetronicApp',
									files: [
										'scripts/controllers/UISelectController.js'
									]
								}
							]);
						}
					]
				}
			})

			// UI Bootstrap
			.state('uibootstrap', {
				url        : "/ui_bootstrap.html",
				templateUrl: "views/ui_bootstrap.html",
				data       : {pageTitle: 'AngularJS UI Bootstrap'},
				controller : "GeneralPageController",
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load([
								{
									name : 'MetronicApp',
									files: [
										'scripts/controllers/GeneralPageController.js'
									]
								}
							]);
						}
					]
				}
			})

			// Tree View
			.state('tree', {
				url        : "/tree",
				templateUrl: "views/tree.html",
				data       : {pageTitle: 'jQuery Tree View'},
				controller : "GeneralPageController",
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load([
								{
									name        : 'MetronicApp',
									insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
									files       : [
										'bower_components/jstree/dist/themes/default/style.min.css',

										'bower_components/jstree/dist/jstree.min.js',
										'assets/pages/scripts/ui-tree.min.js',
										'scripts/controllers/GeneralPageController.js'
									]
								}
							]);
						}
					]
				}
			})

			// Form Tools
			.state('formtools', {
				url        : "/form-tools",
				templateUrl: "views/form_tools.html",
				data       : {pageTitle: 'Form Tools'},
				controller : "GeneralPageController",
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load([
								{
									name        : 'MetronicApp',
									insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
									files       : [
										'bower_components/bootstrap-fileinput/css/fileinput.min.css',
										'bower_components/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.min.css',
										'bower_components/bootstrap-markdown/css/bootstrap-markdown.min.css',
										'bower_components/typeahead.js/dist/typeahead.css',

										'bower_components/fuelux/js/spinner.js',
										'bower_components/bootstrap-fileinput/js/fileinput.min.js',
										'bower_components/jquery.inputmask/dist/min/jquery.inputmask.bundle.min.js',
										'bower_components/jquery-input-ip-address-control/jquery.input-ip-address-control-1.0.min.js',
										'bower_components/pwstrength-bootstrap/dist/pwstrength-bootstrap.min.js',
										'bower_components/bootstrap-switch/dist/js/bootstrap-switch.min.js',
										'bower_components/bootstrap-maxlength/src/bootstrap-maxlength.js',
										'bower_components/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.js',
										'bower_components/typeahead.js/dist/handlebars.min.js',
										'bower_components/typeahead.js/dist/typeahead.bundle.min.js',
										'assets/pages/scripts/components-form-tools-2.min.js',

										'scripts/controllers/GeneralPageController.js'
									]
								}
							]);
						}
					]
				}
			})

			// Date & Time Pickers
			.state('pickers', {
				url        : "/pickers",
				templateUrl: "views/pickers.html",
				data       : {pageTitle: 'Date & Time Pickers'},
				controller : "GeneralPageController",
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load([
								{
									name        : 'MetronicApp',
									insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
									files       : [
										'bower_components/clockface/css/clockface.css',
										'bower_components/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
										'bower_components/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
										'bower_components/bootstrap-colorpicker/css/colorpicker.css',
										'bower_components/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',

										'bower_components/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
										'bower_components/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
										'bower_components/clockface/js/clockface.js',
										'bower_components/bootstrap-colorpicker/js/bootstrap-colorpicker.js',
										'bower_components/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',

										'../assets/pages/scripts/components-date-time-pickers.min.js',

										'scripts/controllers/GeneralPageController.js'
									]
								}
							]);
						}
					]
				}
			})

			// Custom Dropdowns
			.state('dropdowns', {
				url        : "/dropdowns",
				templateUrl: "views/dropdowns.html",
				data       : {pageTitle: 'Custom Dropdowns'},
				controller : "GeneralPageController",
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load([
								{
									name        : 'MetronicApp',
									insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
									files       : [
										'bower_components/bootstrap-select/css/bootstrap-select.min.css',
										'bower_components/select2/css/select2.min.css',
										'bower_components/select2/css/select2-bootstrap.min.css',

										'bower_components/bootstrap-select/js/bootstrap-select.min.js',
										'bower_components/select2/js/select2.full.min.js',

										'../assets/pages/scripts/components-bootstrap-select.min.js',
										'../assets/pages/scripts/components-select2.min.js',

										'scripts/controllers/GeneralPageController.js'
									]
								}
							]);
						}
					]
				}
			})

			// Advanced Datatables
			.state('datatablesAdvanced', {
				url        : "/datatables/managed.html",
				templateUrl: "views/datatables/managed.html",
				data       : {pageTitle: 'Advanced Datatables'},
				controller : "GeneralPageController",
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load({
								name        : 'MetronicApp',
								insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
								files       : [
									'bower_components/datatables/datatables.min.css',
									'bower_components/datatables/plugins/bootstrap/datatables.bootstrap.css',

									'bower_components/datatables/datatables.all.min.js',

									'../assets/pages/scripts/table-datatables-managed.min.js',

									'scripts/controllers/GeneralPageController.js'
								]
							});
						}
					]
				}
			})

			// Ajax Datetables
			.state('datatablesAjax', {
				url        : "/datatables/ajax.html",
				templateUrl: "views/datatables/ajax.html",
				data       : {pageTitle: 'Ajax Datatables'},
				controller : "GeneralPageController",
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load({
								name        : 'MetronicApp',
								insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
								files       : [
									'bower_components/datatables/datatables.min.css',
									'bower_components/datatables/plugins/bootstrap/datatables.bootstrap.css',
									'bower_components/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',

									'bower_components/datatables/datatables.all.min.js',
									'bower_components/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
									'../assets/global/scripts/datatable.min.js',

									'js/scripts/table-ajax.js',
									'scripts/controllers/GeneralPageController.js'
								]
							});
						}
					]
				}
			})

			// User Profile
			.state("profile", {
				url        : "/profile",
				templateUrl: "views/profile/main.html",
				data       : {pageTitle: 'User Profile'},
				controller : "UserProfileController",
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load({
								name        : 'MetronicApp',
								insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
								files       : [
									'bower_components/bootstrap-fileinput/bootstrap-fileinput.css',
									'../assets/pages/css/profile.css',

									'bower_components/jquery.sparkline.min.js',
									'bower_components/bootstrap-fileinput/bootstrap-fileinput.js',

									'../assets/pages/scripts/profile.min.js',

									'scripts/controllers/UserProfileController.js'
								]
							});
						}
					]
				}
			})

			// User Profile Dashboard
			.state("profile.dashboard", {
				url        : "/dashboard",
				templateUrl: "views/profile/dashboard.html",
				data       : {pageTitle: 'User Profile'}
			})

			// User Profile Account
			.state("profile.account", {
				url        : "/account",
				templateUrl: "views/profile/account.html",
				data       : {pageTitle: 'User Account'}
			})

			// User Profile Help
			.state("profile.help", {
				url        : "/help",
				templateUrl: "views/profile/help.html",
				data       : {pageTitle: 'User Help'}
			})

			// Todo
			.state('todo', {
				url        : "/todo",
				templateUrl: "views/todo.html",
				data       : {pageTitle: 'Todo'},
				controller : "TodoController",
				resolve    : {
					deps: [
						'$ocLazyLoad', function ($ocLazyLoad) {
							return $ocLazyLoad.load({
								name        : 'MetronicApp',
								insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
								files       : [
									'bower_components/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
									'../assets/apps/css/todo-2.css',
									'bower_components/select2/css/select2.min.css',
									'bower_components/select2/css/select2-bootstrap.min.css',

									'bower_components/select2/js/select2.full.min.js',

									'bower_components/bootstrap-datepicker/js/bootstrap-datepicker.min.js',

									'../assets/apps/scripts/todo-2.min.js',

									'scripts/controllers/TodoController.js'
								]
							});
						}
					]
				}
			})

	}
]);

/* Init global settings and run the app */
MetronicApp.run([
	"$rootScope", "settings", "$state", function ($rootScope, settings, $state) {
		$rootScope.$state    = $state; // state to be accessed from view
		$rootScope.$settings = settings; // state to be accessed from view
	}
]);