'use strict';

angular.module('MetronicApp').controller('DashboardController', function ($rootScope, $scope, $http, $timeout, $auth, sessionControl) {
		$scope.$on('$viewContentLoaded', function () {
			// initialize core components
			App.initAjax();
		});
		
		$scope.payload = $auth.getPayload();
		
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageContentWhite  = false;
		$rootScope.settings.layout.pageBodySolid     = false;
		$rootScope.settings.layout.pageSidebarClosed = true;
	}
);