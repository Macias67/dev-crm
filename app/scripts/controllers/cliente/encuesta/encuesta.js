'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:EncuestaCtrl
 * @description
 * # ClienteEncuestaEncuestactrlCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('EncuestaCtrl', [
		'$rootScope', '$scope', 'dataCaso', 'Caso', 'CasoEncuesta', 'NotifService', function ($rootScope, $scope, dataCaso, Caso, CasoEncuesta, NotifService) {
			var vm = this;
			
			if (dataCaso.$resolved) {
				vm.caso = dataCaso.data;
			}
			
			vm.prettify = function (json) {
				return JSON.stringify(json, null, '  ');
			};
			
			vm.formulario = {
				form     : null,
				pregunta1: 'si',
				porquep1 : null,
				pregunta2: 'si',
				porquep2 : null,
				pregunta3: "10",
				pregunta4: "10",
				pregunta5: 'si',
				datosp5  : {
					nombre  : null,
					email   : null,
					telefono: null
				},
				porquep5 : null,
				opinion  : null,
				puntajeP1: 0,
				puntajeP2: 0,
				puntajeP3: 0,
				puntajeP4: 0,
				puntajeP5: 0,
				enviar   : function () {
					
					var data = {
						encuesta: [
							{
								pregunta : '¿Usted fue atendido con amabilidad y respeto todo el tiempo?',
								respuesta: vm.formulario.pregunta1,
								extra    : vm.formulario.porquep1
							},
							{
								pregunta : '¿Durante el desarrollo de su caso se le brindo información suficiente, clara y oportuna sobre los trabajos a realizar?',
								respuesta: vm.formulario.pregunta2,
								extra    : vm.formulario.porquep2
							},
							{
								pregunta : '¿Cómo calificaría nuestro tiempo de respuesta y solución a este caso?',
								respuesta: vm.formulario.pregunta3
							},
							{
								pregunta : '¿Cómo calificaría el conocimiento o experiencia del asesor asignado?',
								respuesta: vm.formulario.pregunta4
							},
							{
								pregunta : '¿Estaría dispuesto a recomendar nuestros servicios a alguien más?',
								respuesta: vm.formulario.pregunta5,
								datos    : vm.formulario.datosp5,
								extra    : vm.formulario.porquep5
							},
							{
								opinion: vm.formulario.opinion
							}
						],
						puntaje : vm.formulario.puntajeP1 + vm.formulario.puntajeP2 + vm.formulario.puntajeP3 + vm.formulario.puntajeP4 + vm.formulario.puntajeP5
					};
					
					App.blockUI({
						target      : '#ui-view',
						message     : '<b> Enviando respuestas </b>',
						boxed       : true,
						zIndex      : 99999,
						overlayColor: App.getBrandColor('grey')
					});
					
					CasoEncuesta.save({idCaso: vm.caso.id}, data).$promise.then(function (response) {
						if (response.$resolved) {
							vm.reloadCaso();
							NotifService.success('Se han enviado las respuestas de la encuesta', 'Respuestas enviadas.');
							App.unblockUI('#ui-view');
						}
					}, function (response) {
						NotifService.error('Error al enciar la encuesta, informa esto al departamento de desarrollo.', response.statusText + ' (' + response.status + ')');
						App.unblockUI('#ui-view');
					});
				}
			};
			
			vm.reloadCaso = function () {
				App.blockUI({
					target      : '#ui-view',
					message     : '<b> Cargando datos del caso </b>',
					boxed       : true,
					zIndex      : 99999,
					overlayColor: App.getBrandColor('grey')
				});
				
				Caso.get({id: vm.caso.id}).$promise.then(function (response) {
					if (response.$resolved) {
						vm.caso = response.data;
						App.unblockUI('#ui-view');
					}
				}, function (response) {
					NotifService.error('Error al actualizar datos del caso, informa esto al departamento de desarrollo.', response.statusText + ' (' + response.status + ')');
					App.unblockUI('#ui-view');
				});
			};
			
			vm.onChangeP1 = function () {
				vm.formulario.porquep1 = null;
			};
			
			vm.onChangeP2 = function () {
				vm.formulario.porquep2 = null;
			};
			
			vm.onChangeP5 = function () {
				vm.formulario.datosp5  = {
					nombre  : null,
					telefono: null,
					email   : null
				};
				vm.formulario.porquep5 = null;
			};
			
			$scope.$watch('encuestaCtrl.formulario.pregunta1', function (newV, oldV) {
				if (newV == 'si') {
					vm.formulario.puntajeP1 = 25;
				}
				else {
					vm.formulario.puntajeP1 = 0;
				}
			});
			
			$scope.$watch('encuestaCtrl.formulario.pregunta2', function (newV, oldV) {
				if (newV == 'si') {
					vm.formulario.puntajeP2 = 15;
				}
				else {
					vm.formulario.puntajeP2 = 0;
				}
			});
			
			$scope.$watch('encuestaCtrl.formulario.pregunta3', function (newV, oldV) {
				vm.formulario.puntajeP3 = (newV * 30) / 10;
			});
			
			$scope.$watch('encuestaCtrl.formulario.pregunta4', function (newV, oldV) {
				vm.formulario.puntajeP4 = (newV * 20) / 10;
			});
			
			$scope.$watch('encuestaCtrl.formulario.pregunta5', function (newV, oldV) {
				if (newV == 'si') {
					vm.formulario.puntajeP5 = 10;
				}
				else if (newV == 'no') {
					vm.formulario.puntajeP5 = 5;
				}
				else {
					vm.formulario.puntajeP5 = 0;
				}
			});
			
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
			});
			
			//Nombres
			$rootScope.vista = {
				titulo   : 'Encuesta',
				subtitulo: 'Caso #' + vm.caso.id
			};
			
			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
		}
	]);
