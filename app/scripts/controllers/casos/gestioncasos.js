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
		'$rootScope', '$scope', 'dataCaso', '$uibModal', 'Caso',
		function ($rootScope, $scope, dataCaso, $uibModal, Caso) {
			var vm  = this;
			vm.caso = dataCaso.data;
			
			setTimeout(function () {
				App.unblockUI('#ui-view');
			}, 2000);
			
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
					overlayColor: App.getBrandColor('blue'),
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
			
			vm.detalleTarea = function (idTarea) {
				App.blockUI({
					target      : '#ui-view',
					animate     : true,
					overlayColor: App.getBrandColor('blue'),
					zIndex      : 9999
				});
				
				$uibModal.open({
					backdrop   : 'static',
					templateUrl: 'modalDetallesTarea.html',
					controller : 'ModalDetalleTareas as modalDetalleTareas'
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
					templateUrl: 'modalEditaTarea.html',
					controller : 'ModalEditaTareas as modalEditaTareas'
				});
			};
			
			$scope.$on('creadaNuevaTarea', function (e, args) {
				vm.caso = args;
			});
			
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
				App.scrollTop();
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Cargando datos del caso </b>',
					boxed       : true,
					zIndex      : 99999,
					overlayColor: App.getBrandColor('grey')
				});
				
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
		'Tarea',
		'toastr',
		function ($rootScope, $scope, $uibModalInstance, dataEjecutivos, idCaso, Tarea, toastr) {
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
				
				Tarea.save({idcaso: idCaso}, vm.tarea, function (response) {
					if (response.hasOwnProperty('errors')) {
						for (var key in response.errors) {
							if (response.errors.hasOwnProperty(key)) {
								toastr.error(response.errors[key][0], 'Hay errores con la tarea.');
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
						toastr.success('Se generó nueva tarea para ' + ejecutivo.nombre + ' ' + ejecutivo.apellido + '.', 'Nueva tarea asignada.');
					}
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
				console.log(vm.ejecutivos);
				$uibModalInstance.dismiss('cancel');
			};
		}
	])
	.controller('ModalDetalleTareas', [
		'$rootScope', '$scope', '$uibModalInstance', function ($rootScope, $scope, $uibModalInstance) {
			var vm = this;
			App.unblockUI('#ui-view');
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	])
	.controller('ModalEditaTareas', [
		'$rootScope', '$scope', '$uibModalInstance', function ($rootScope, $scope, $uibModalInstance) {
			var vm = this;
			App.unblockUI('#ui-view');
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	]);
