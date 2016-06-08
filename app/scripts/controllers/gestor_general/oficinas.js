'use strict';

/**
 * @ngdoc function
 * @name MetronicApp.controller:OficinasCtrl
 * @description
 * # OficinasCtrl
 * Controller of the MetronicApp
 */
angular.module('MetronicApp')
	.controller('OficinasCtrl', [
		'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$scope', '$rootScope', '$uibModal',
		function (DTOptionsBuilder, DTColumnBuilder, $compile, $scope, $rootScope, $uibModal) {
			var vm = this;
			
			//Nombres
			$rootScope.vista = {
				titulo   : 'Oficinas',
				subtitulo: 'Gestión de oficnas'
			};
			
			// set sidebar closed and body solid layout mode
			$rootScope.settings.layout.pageContentWhite  = false;
			$rootScope.settings.layout.pageBodySolid     = false;
			$rootScope.settings.layout.pageSidebarClosed = true;
			
			vm.tableOficinas = {
				message   : '',
				edit      : edit,
				delete    : deleteRow,
				dtInstance: {},
				persons   : {},
				
				dtOptions: DTOptionsBuilder.fromSource('http://beta.json-generator.com/api/json/get/Vyh1La-mW')
					.withLanguageSource('//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json')
					.withDataProp('data')
					.withOption('createdRow', createdRow)
					.withOption('fnRowCallback', rowCallback)
					.withPaginationType('bootstrap_full_number')
					.withBootstrap(),
				
				dtColumns: [
					DTColumnBuilder.newColumn('id').withTitle('ID').withOption('sWidth', '15%'),
					DTColumnBuilder.newColumn('firstName').withTitle('Nombre').renderWith(function (data, type, full) {
						return full.firstName + ' ' + full.lastName;
					}),
					DTColumnBuilder.newColumn(null).notSortable().renderWith(actionsHtml).withOption('sWidth', '15%'),
				]
			};
			
			vm.openModalForm = function () {
				$uibModal.open({
					backdrop   : 'static',
					templateUrl: 'OficinaNuevaForm.html',
					controller : 'ModalOficinaNuevaCtrl as modalOficinaNueva',
					size       : 'lg'
				})
			};
			
			function edit(person) {
				vm.tableOficinas.message = 'You are trying to edit the row: ' + JSON.stringify(person);
				// Edit some data and call server to make changes...
				// Then reload the data so that DT is refreshed
				vm.tableOficinas.dtInstance.reloadData();
			}
			
			function deleteRow(person) {
				vm.tableOficinas.message = 'You are trying to remove the row: ' + JSON.stringify(person);
				// Delete some data and call server to make changes...
				// Then reload the data so that DT is refreshed
				vm.tableOficinas.dtInstance.reloadData();
			}
			
			function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
			}
			
			function createdRow(row, data, dataIndex) {
				// Recompiling so we can bind Angular directive to the DT
				$compile(angular.element(row).contents())($scope);
			}
			
			function actionsHtml(data, type, full, meta) {
				vm.tableOficinas.persons[data.id] = data;
				return '<button type="button" class="btn blue btn-xs" ng-click="showCase.tableOficinas.edit(oficinaCtrl.tableOficinas.persons[' + data.id + '])">' +
					'   <i class="fa fa-edit"></i>' +
					'</button>&nbsp;' +
					'<button type="button" class="btn red btn-xs" ng-click="showCase.tableOficinas.delete(oficinaCtrl.tableOficinas.persons[' + data.id + '])" )"="">' +
					'   <i class="fa fa-trash-o"></i>' +
					'</button>';
			}
		}
	])
	.controller('ModalOficinaNuevaCtrl', [
		'$scope', '$uibModalInstance', '$filter', 'GeoCoder', 'toastr', 'NavigatorGeolocation', 'NgMap', 'oficinaService',
		function ($scope, $uibModalInstance, $filter, GeoCoder, toastr, NavigatorGeolocation, NgMap, oficinaService) {
			var vm = this;

			vm.oficinaForm = {};
			vm.paraBuscar = '';
			vm.centroMapa = [
				20.3417485,
				-102.76523259999999
			];
			vm.zoomMapa   = 13;

			vm.form = oficinaService.getInstance();
			
			$scope.$watch('modalOficinaNueva.form.calle', function () {
				vm.form.calle = $filter('ucfirst')(vm.form.calle);
			});
			$scope.$watch('modalOficinaNueva.form.colonia', function () {
				vm.form.colonia = $filter('ucfirst')(vm.form.colonia);
			});
			$scope.$watch('modalOficinaNueva.form.ciudad', function () {
				vm.form.ciudad = $filter('ucfirst')(vm.form.ciudad);
			});
			$scope.$watch('modalOficinaNueva.form.estado', function () {
				vm.form.estado = $filter('ucfirst')(vm.form.estado);
			});
			$scope.$watch('modalOficinaNueva.centroMapa', function () {
				vm.form.latitud  = vm.centroMapa[0];
				vm.form.longitud = vm.centroMapa[1];
			});
			$scope.$watchGroup(
				[
					'modalOficinaNueva.form.calle',
					'modalOficinaNueva.form.numero',
					'modalOficinaNueva.form.colonia',
					'modalOficinaNueva.form.ciudad',
					'modalOficinaNueva.form.estado'
				],
				function (newValues, oldValues, scope) {
					// newValues array contains the current values of the watch expressions
					// with the indexes matching those of the watchExpression array
					// i.e.
					// newValues[0] -> $scope.foo
					// and
					// newValues[1] -> $scope.bar
					
					vm.paraBuscar = vm.form.calle + ' '
						+ vm.form.numero + ', '
						+ vm.form.colonia + ', '
						+ vm.form.ciudad + ', '
						+ vm.form.estado;
				}
			);

			// Obtengo posicion actual
			NavigatorGeolocation.getCurrentPosition()
				.then(function (position) {
					var lat       = position.coords.latitude, lng = position.coords.longitude;
					vm.centroMapa = [lat, lng];
					vm.zoomMapa   = 16;
				});

			/**
			 * Obtengo propiesdades del mapa, en especial el marcador,
			 * para poder añadirle el evento drag y dragend
			 */
			NgMap.getMap().then(function (map) {
				var marker = map.markers[0];

				marker.addListener('drag', function (event) {
					$scope.$apply(function () {
						vm.centroMapa = [
							event.latLng.lat(),
							event.latLng.lng()
						];
					});
					map.setCenter(marker.getPosition());
				});
				
				marker.addListener('dragend', function (event) {
					var latlng = {lat: vm.centroMapa[0], lng: vm.centroMapa[1]};
					GeoCoder.geocode({location: latlng}).then(function (result) {
						vm.paraBuscar = result[0].formatted_address;
					});
				});
			});
			
			vm.geoCode = function () {
				GeoCoder.geocode({address: vm.paraBuscar}).then(function (result) {
					var lat       = result[0].geometry.location.lat();
					var lng       = result[0].geometry.location.lng();
					vm.centroMapa = [lat, lng];
					vm.zoomMapa   = 16;
				});
			};
			
			vm.guarda = function () {
				oficinaService.storeOficina();
				console.log(vm.oficinaForm);
				//$uibModalInstance.close();
				vm.oficinaForm.$setPristine();
			};
			
			vm.cancel = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}
	]);
