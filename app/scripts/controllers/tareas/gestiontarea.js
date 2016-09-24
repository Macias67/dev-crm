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
		'$rootScope', '$scope', 'dataTarea', '$uibModal', 'authUser', '$state', 'Caso', 'Tarea', 'NotifService', '$filter', 'TareaNota', 'NotaFB',
		function ($rootScope, $scope, dataTarea, $uibModal, authUser, $state, Caso, Tarea, NotifService, $filter, TareaNota, NotaFB) {
			var vm   = this;
			vm.tarea = dataTarea.data;
			
			vm.notas = {
				formNotas: null,
				form     : {
					descripcion: '',
					tipo       : 1,
					file       : null
				},
				loading  : false,
				progress : 0,
				guarda   : function () {
					vm.notas.loading = true;
					
					var tareaNota = new TareaNota(vm.notas.form);
					tareaNota.$save({idtarea: vm.tarea.id}, function (response) {
						vm.tarea         = response.data;
						var notas        = vm.tarea.notas.todas;
						var selectedNota = notas[notas.length - 1];
						NotaFB.refObject(selectedNota.id).set(selectedNota)
							.then(function () {
								console.log('Synchronization succeeded');
							})
							.catch(function (error) {
								console.log('Synchronization failed');
							});
						
						vm.notas.loading = false;
					}, function (error) {
						console.log(error);
						vm.notas.loading = false;
					});
					
					
					var file = vm.notas.form.file;
					if (file != null) {
						var uploadTask = firebase.storage().ref().child('notas/' + file.name).put(file);
						uploadTask.on('state_changed', function (snapshot) {
							// Observe state change events such as progress, pause, and resume
							// See below for more detail
							$scope.$apply(function () {
								vm.notas.progress = $filter('number')((snapshot.bytesTransferred / snapshot.totalBytes) * 100, 0);
							});
						}, function (error) {
							// Handle unsuccessful uploads
						}, function () {
							// Handle successful uploads on complete
							// For instance, get the download URL: https://firebasestorage.googleapis.com/...
							var downloadURL = uploadTask.snapshot.downloadURL;
							console.log(downloadURL);
							$scope.$apply(function () {
								vm.notas.formNotas.$setPristine();
								vm.notas.formNotas.$setUntouched();
								vm.notas.formNotas.$dirty = false;
								vm.notas.form             = {
									descripcion: '',
									tipo       : 1,
									file       : null
								};
								vm.notas.loading          = false;
								vm.notas.progress         = 0;
							});
						});
					}
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
