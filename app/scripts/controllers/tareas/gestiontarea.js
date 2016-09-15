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
		'$rootScope', '$scope', 'dataTarea', '$uibModal', 'authUser', '$state', 'Caso', 'Tarea',
		function ($rootScope, $scope, dataTarea, $uibModal, authUser, $state, Caso, Tarea) {
			var vm   = this;
			vm.tarea = dataTarea.data;
			
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
					vm.tarea     = response.data;
					cargadoTarea = true;
					
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
	]);
