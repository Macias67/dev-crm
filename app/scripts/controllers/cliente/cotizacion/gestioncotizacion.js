'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:GestionCotizacionCtrl
 * @description
 * # ClienteCotizacionGestioncotizacionctrlCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('GestionCotizacionCtrl', [
		'$scope',
		'$rootScope',
		'Cotizacion',
		'Pago',
		'dataCotizacion',
		'$filter',
		'NotifService',
		'authUser',
		'$timeout',
		'ngAudio',
		function ($scope, $rootScope, Cotizacion, Pago, dataCotizacion, $filter, NotifService, authUser, $timeout, ngAudio) {
			var vm       = this;
			vm.uploading = false;
			vm.progress  = 0;
			
			vm.reloadPagos = function () {
				vm.pagosPorRevisar = [];
				vm.pagosValidos    = [];
				vm.pagosInvalidos  = [];
				vm.cotizacion.pagos.forEach(function (pago, index) {
					if (pago.revisado) {
						if (pago.valido) {
							vm.pagosValidos.push(pago);
						}
						else {
							vm.pagosInvalidos.push(pago);
						}
					}
					else {
						vm.pagosPorRevisar.push(pago);
					}
				});
			};
			
			if (dataCotizacion.$resolved) {
				vm.cotizacion = dataCotizacion.data;
				vm.reloadPagos();
			}
			
			vm.formArchivos = {
				archivo    : null,
				pago       : '',
				cantidad   : 0,
				comentarios: ''
			};
			
			vm.total = function () {
				if (vm.formArchivos.pago == 'total') {
					vm.formArchivos.cantidad = vm.cotizacion.total;
				}
				else {
					vm.formArchivos.cantidad = 0;
				}
			};
			
			vm.uploadFiles = function () {
				var metadata = {
					customMetadata: {
						'cotizacion_id': vm.cotizacion.id
					}
				};
				
				var storageRef = firebase.storage().ref('comprobantes/' + vm.cotizacion.id);
				var uploadTask = storageRef.child(vm.formArchivos.archivo.name).put(vm.formArchivos.archivo, metadata);
				vm.uploading   = true;
				App.blockUI({
					target : '#ui-view',
					animate: true,
					zIndex : 99999
				});
				uploadTask.on('state_changed', function (snapshot) {
					var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					$scope.$apply(function () {
						vm.progress = $filter('number')(progress, 0);
					});
				}, function (error) {
					// Handle unsuccessful uploads
					$scope.$apply(function () {
						vm.uploading = false;
					});
					App.unblockUI('#ui-view');
					console.log(error);
				}, function () {
					var pagoData = {
						cotizacion_id: vm.cotizacion.id,
						contacto_id  : authUser.getSessionData().id,
						cantidad     : vm.formArchivos.cantidad,
						tipo         : vm.formArchivos.pago,
						comentario   : vm.formArchivos.comentarios,
						archivo      : {
							url        : uploadTask.snapshot.downloadURL,
							contentType: uploadTask.snapshot.metadata.contentType,
							fullPath   : uploadTask.snapshot.metadata.fullPath,
							hash       : uploadTask.snapshot.metadata.md5Hash,
							name       : uploadTask.snapshot.metadata.name,
							size       : uploadTask.snapshot.metadata.size
						}
					};
					var pago     = new Pago(pagoData);
					pago.$save({idCotizacion: vm.cotizacion.id})
						.then(function (response) {
							if (response.$resolved) {
								App.unblockUI('#ui-view');
								
								vm.subepago.$setPristine();
								vm.subepago.$setUntouched();
								vm.subepago.$dirty = false;
								
								vm.uploading = false;
								vm.progress  = 0;
								
								vm.formArchivos = {
									archivo    : null,
									pago       : '',
									cantidad   : 0,
									comentarios: ''
								};
								
								vm.reloadCotizacion();
								NotifService.success('El pago se ha subido con éxito para su verficación.', 'Pago subido con éxito');
							}
						}, function (response) {
							vm.uploading = false;
							vm.progress  = 0;
							
							if (response.hasOwnProperty('errors')) {
								for (var key in response.errors) {
									if (response.errors.hasOwnProperty(key)) {
										NotifService.error(response.errors[key][0], 'Error con el formulario.');
									}
								}
								App.unblockUI('#ui-view');
								return;
							}
							
							App.unblockUI('#ui-view');
							// Create a reference to the file to delete
							var desertRef = storageRef.child(uploadTask.snapshot.metadata.name);
							// Delete the file
							desertRef.delete().then(function () {
								// File deleted successfully
							}).catch(function (error) {
								// Uh-oh, an error occurred!
							});
							NotifService.error(response.data.message, 'ERROR ' + response.status);
						});
				});
			};
			
			vm.reloadCotizacion = function () {
				App.scrollTop();
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Actuliando cotización </b>',
					boxed       : true,
					overlayColor: App.getBrandColor('grey'),
					zIndex      : 99999
				});
				
				Cotizacion.get({id: vm.cotizacion.id}).$promise.then(function (response) {
					if (response.$resolved) {
						vm.cotizacion = response.data;
						vm.reloadPagos();
						App.unblockUI('#ui-view');
					}
				}, function (response) {
					NotifService.error(response.data.message, response.statusText + ' (' + response.status + ')');
					App.unblockUI('#ui-view');
				});
			};
			
			var cont           = $('#chats');
			var form           = $('.chat-form', cont);
			var input          = $('input', form);
			vm.usuarioActual   = authUser.getSessionData();
			var getLastPostPos = function () {
				var height = 0;
				cont.find("li.out, li.in").each(function () {
					height = height + $(this).outerHeight();
				});
				return height;
			};
			
			input.keypress(function (e) {
				if (e.which == 13) {
					vm.chat.enviar();
					return false; //<---- Add this line
				}
			});
			
			vm.chat = {
				enviar: function () {
					var inputText = angular.element('#mensaje');
					var mensaje   = inputText.val();
					if (mensaje.length == 0) {
						return;
					}
					firebase.database().ref('cotizacion/' + vm.cotizacion.id + '/chat').push({
						usuario  : {
							id    : vm.usuarioActual.id,
							nombre: vm.usuarioActual.nombre + ' ' + vm.usuarioActual.apellido,
							color : '#5E738B',
							class : 'blue-dark',
							rol: vm.usuarioActual.cliente.razonsocial
						},
						visto    : [],
						mensaje  : mensaje,
						timestamp: moment().unix()
					}).then(function (response) {
						inputText.val('');
					}, function (response) {
					});
				}
			};
			
			vm.mensajesChat = [];
			firebase.database().ref('cotizacion/' + vm.cotizacion.id + '/chat').on('value', function (snapshot) {
				$timeout(function () {
					vm.mensajesChat = snapshot.val();
				});
				
				setTimeout(function () {
					ngAudio.setUnlock(false);
					ngAudio.load('sounds/duo.mp3').play();
					cont.find('.scroller').slimScroll({
						scrollTo: getLastPostPos()
					});
				});
			});
			
			setTimeout(function () {
				cont.find('.scroller').slimScroll({
					scrollTo: getLastPostPos()
				});
			}, 2000);
						
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
			});
			
			//Nombres
			$rootScope.vista = {
				titulo   : 'Gestión de la cotización',
				subtitulo: 'Folio #' + vm.cotizacion.id
			};
			
			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
		}
	]);
