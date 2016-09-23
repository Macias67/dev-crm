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
		'$rootScope', '$scope', 'dataTarea', '$uibModal', 'authUser', '$state', 'Caso', 'Tarea', '$timeout',
		function ($rootScope, $scope, dataTarea, $uibModal, authUser, $state, Caso, Tarea, $timeout) {
			var vm   = this;
			vm.tarea = dataTarea.data;
			
			vm.notas = {
				formNotas: null,
				form     : {
					descripcion: '',
					tipo: 'publica',
					archivo: ''
				},
				loading  : false,
				guarda   : function () {
					this.loading = true;
					console.log(this.form);
					$timeout(function() {
						vm.notas.loading = false;
					}, 2000);
				}
			};
			
			vm.modalAsignaFechas = function () {
				$uibModal.open({
					backdrop   : 'static',
					templateUrl: 'modalAsignaFechas.html',
					controller : 'ModalAsignaFechas as modalAsignaFechas',
					size       : 'lg',
					resolve    : {
						dataIDTarea: vm.tarea.id
					}
				});
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
	])
	.controller('ModalAsignaFechas', [
		'$rootScope', '$scope', '$uibModalInstance', '$filter', 'toastr', 'dataIDTarea',
		function ($rootScope, $scope, $uibModalInstance, $filter, toastr, dataIDTarea) {
			var vm = this;
			
			vm.formFechas = {};
			vm.form       = {
				fechadeinicio: ''
			};
			
			// Disable weekend selection
			vm.disabled    = function (calendarDate, mode) {
				return mode === 'day' && ( calendarDate.getDay() === 0 || calendarDate.getDay() === 6 );
			};
			vm.dateOptions = {
				showWeeks  : false,
				startingDay: 0
			};
			
			vm.guarda = function () {
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Guardando prouducto </b>',
					boxed       : true,
					overlayColor: App.getBrandColor('grey'),
					zIndex      : 99999
				});
				
				if (vm.formEdit) {
					Oficina.update({id: dtOficina.data.id}, vm.form, function (response) {
						if (response.hasOwnProperty('errors')) {
							for (var key in response.errors) {
								if (response.errors.hasOwnProperty(key)) {
									toastr.error(response.errors[key][0], 'Error con el formulario.');
								}
							}
						}
						else {
							$uibModalInstance.close();
							$rootScope.$broadcast('reloadTable');
							toastr.success('Se actualizó los datos de la oficina', 'Edición de oficina');
						}
					});
				}
				else {
					var producto = new Producto(vm.form);
					producto.$save(function (response) {
						if (response.hasOwnProperty('errors')) {
							for (var key in response.errors) {
								if (response.errors.hasOwnProperty(key)) {
									toastr.error(response.errors[key][0], 'Error con el formulario.');
								}
							}
						}
						else {
							$uibModalInstance.close();
							$rootScope.$broadcast('reloadTableProductos');
							toastr.success('Se registró un nuevo Producto', 'Nuevo Producto');
						}
					});
				}
				
				setTimeout(function () {
					App.unblockUI('#ui-view');
				}, 1000);
				
			};
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	]);
