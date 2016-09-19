'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.NotifService
 * @description
 * # NotifService
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
	.factory('NotifService', ['toastr', 'ngAudio',
		function (toastr, ngAudio) {
			return {
				success: function (mensaje, titulo) {
					ngAudio.load('sounds/chord.mp3').play();
					toastr.success(mensaje, titulo);
				},
				info: function (mensaje, titulo) {
					ngAudio.load('sounds/beep.mp3').play();
					toastr.info(mensaje, titulo);
				},
				warning: function (mensaje, titulo) {
					ngAudio.load('sounds/ping.mp3').play();
					toastr.warning(mensaje, titulo);
				},
				error: function (mensaje, titulo) {
					ngAudio.load('sounds/cool.mp3').play();
					toastr.error(mensaje, titulo);
				}
			};
		}
	]);
