'use strict';

describe('Controller: CotizacionNuevacotizacionctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('MetronicApp'));

  var CotizacionNuevacotizacionctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CotizacionNuevacotizacionctrlCtrl = $controller('CotizacionNuevacotizacionctrlCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(CotizacionNuevacotizacionctrlCtrl.awesomeThings.length).toBe(3);
  });
});
