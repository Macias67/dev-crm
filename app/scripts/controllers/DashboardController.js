'use strict';

angular.module('MetronicApp')
	.controller('DashboardController', [
		'$scope', '$rootScope', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$auth', '$uibModal', 'CRM_APP', 'Oficina', '$ngBootbox', 'toastr',
		function ($rootScope, $scope, DTOptionsBuilder, DTColumnBuilder, $compile, $auth, $uibModal, CRM_APP, Oficina, $ngBootbox, toastr) {
			$scope.$on('$viewContentLoaded', function () {
				// initialize core components
				App.initAjax();
			});
			
			var vm = this;
			
			//Nombres
			$rootScope.vista = {
				titulo   : 'Bienvenido',
				subtitulo: 'Gestión general'
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

				dtOptions: DTOptionsBuilder.fromSource(CRM_APP.url + 'oficinas')
					.withFnServerData(serverData)
					.withLanguageSource('//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json')
					.withDataProp('data')
					.withOption('createdRow', createdRow)
					.withOption('fnRowCallback', rowCallback)
					.withPaginationType('bootstrap_full_number')
					.withBootstrap(),

				dtColumns: [
					DTColumnBuilder.newColumn('id').withTitle('ID').withOption('sWidth', '10%'),
					DTColumnBuilder.newColumn('calle').withTitle('Calle').renderWith(function (data, type, full) {
						return full.calle + ' ' + full.numero;
					}),
					DTColumnBuilder.newColumn('ciudad').withTitle('Ciudad').renderWith(function (data, type, full) {
						return full.ciudad + ', ' + full.estado;
					}),
					DTColumnBuilder.newColumn(null).notSortable().renderWith(actionsHtml).withOption('sWidth', '14%'),
				]
			};

			vm.openModalForm = function () {
				$uibModal.open({
					backdrop   : 'static',
					templateUrl: 'OficinaNuevaForm.html',
					controller : 'ModalOficinaNuevaCtrl as modalOficinaNueva',
					size       : 'lg',
					resolve    : {
						dtOficina: null
					}
				});
			};

			vm.openModalEditForm = function (id) {

				App.blockUI({
					target      : '#ui-view',
					animate     : true,
					overlayColor: App.getBrandColor('grey'),
					zIndex      : 99999
				});

				var oficina = Oficina.get({id: id}, function () {
					App.unblockUI('#ui-view');
					$uibModal.open({
						backdrop   : 'static',
						templateUrl: 'OficinaNuevaForm.html',
						controller : 'ModalOficinaNuevaCtrl as modalOficinaNueva',
						size       : 'lg',
						resolve    : {
							dtOficina: oficina
						}
					});
				});
			};

			vm.deleteOficina = function (id) {
				$ngBootbox.confirm('<b>¿Seguro de eliminar esta oficina?</b>')
					.then(function () {

						App.blockUI({
							target      : '#ui-view',
							message     : '<b> Eliminado oficina </b>',
							boxed       : true,
							overlayColor: App.getBrandColor('grey'),
							zIndex      : 99999
						});

						Oficina.update({id: id}, {online: 0}, function (response) {
							if (response.hasOwnProperty('errors')) {
								for (var key in response.errors) {
									if (response.errors.hasOwnProperty(key)) {
										toastr.error(response.errors[key][0], 'Error con el formulario.');
									}
								}
							}
							else {
								App.unblockUI('#ui-view');
								vm.reloadTable();
								toastr.success('La oficina se eliminó correctamete', 'Oficina eliminada');
							}
						});
					}, function () {
					});
			};

			vm.reloadTable = function () {

				App.blockUI({
					target      : '#tableOficinas',
					animate     : true,
					overlayColor: App.getBrandColor('grey')
				});

				vm.tableOficinas.dtInstance.reloadData();

				setTimeout(function () {
					App.unblockUI('#tableOficinas');
				}, 1500);
			};

			function serverData(sSource, aoData, fnCallback, oSettings) {
				oSettings.jqXHR = $.ajax({
					'dataType'  : 'json',
					'type'      : 'GET',
					'url'       : CRM_APP.url + 'oficinas',
					'data'      : aoData,
					'success'   : fnCallback,
					'beforeSend': function (xhr) {
						xhr.setRequestHeader('Accept', 'application/vnd.crm.v1+json');
						xhr.setRequestHeader('Authorization', 'Bearer ' + $auth.getToken());
						xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
					}
				});
			}

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
				return '<button type="button" class="btn blue btn-xs" ng-click = "oficinaCtrl.openModalEditForm(' + data.id + ')">' +
					'   <i class="fa fa-edit"></i>' +
					'</button>&nbsp;' +
					'<button type="button" class="btn red btn-xs" ng-click="oficinaCtrl.deleteOficina(' + data.id + ')">' +
					'   <i class="fa fa-trash-o"></i>' +
					'</button>';
			}

			$scope.$on('reloadTable', function () {
				vm.reloadTable();
			});
		}
	]);