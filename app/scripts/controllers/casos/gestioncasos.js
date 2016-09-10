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
		'$rootScope', '$scope', 'dataCaso', '$uibModal',
		function ($rootScope, $scope, dataCaso, $uibModal) {
			var vm  = this;
			vm.caso = dataCaso.data;
			
			setTimeout(function () {
				App.unblockUI('#ui-view');
			}, 2000);
			
			vm.nuevaTarea = function () {
				App.scrollTop();
				App.blockUI({
					target      : '#ui-view',
					animate     : true,
					overlayColor: App.getBrandColor('blue'),
					zIndex      : 9999
				});
				
				$uibModal.open({
					backdrop   : 'static',
					templateUrl: 'modalNuevaTarea.html',
					controller : 'ModalNuevaTarea as modalNuevaTarea',
					resolve    : {
						dataEjecutivos: [
							'Ejecutivo', function (Ejecutivo) {
								return Ejecutivo.get({online:true}).$promise;
							}
						]
					}
				});
			};
			
			vm.detalleTarea = function (idTarea) {
				
			};
			
			vm.editaTarea = function (idTarea) {
				
			};
			
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
				titulo   : 'Caso #' + vm.caso.id,
				subtitulo: 'Caso del cliente ' + vm.caso.cliente.razonsocial
			};
			
			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
		}
	])
	.controller('ModalNuevaTarea', [
		'$rootScope', '$scope', '$uibModalInstance', 'dataEjecutivos', function ($rootScope, $scope, $uibModalInstance, dataEjecutivos) {
			App.unblockUI('#ui-view');
			
			var vm        = this;
			vm.ejecutivos = dataEjecutivos.data;
			vm.ejecutivoSelected = vm.ejecutivos[0];
			
			vm.cancel = function () {
				console.log(vm.ejecutivos);
				$uibModalInstance.dismiss('cancel');
			};
		}
	]);
