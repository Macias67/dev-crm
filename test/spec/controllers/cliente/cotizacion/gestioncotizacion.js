'use strict';

describe('Controller: ClienteCotizacionGestioncotizacionctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('MetronicApp'));

  var ClienteCotizacionGestioncotizacionctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ClienteCotizacionGestioncotizacionctrlCtrl = $controller('ClienteCotizacionGestioncotizacionctrlCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ClienteCotizacionGestioncotizacionctrlCtrl.awesomeThings.length).toBe(3);
  });
});
