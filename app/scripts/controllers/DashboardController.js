'use strict';

angular.module('MetronicApp').controller('DashboardController', function ($rootScope, $scope, $http, $timeout, $auth) {
		$scope.$on('$viewContentLoaded', function () {
			// initialize core components
			App.initAjax();
		});

		//Nombres
		$rootScope.vista = {
			titulo   : 'Bienvenido',
			subtitulo: 'Gestión general'
		};

		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageContentWhite  = false;
		$rootScope.settings.layout.pageBodySolid     = false;
		$rootScope.settings.layout.pageSidebarClosed = true;

		$scope.payload = $auth.getPayload();
	}
);