'use strict';

describe('Controller: CotizacionRevisionpagosctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('MetronicApp'));

  var CotizacionRevisionpagosctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CotizacionRevisionpagosctrlCtrl = $controller('CotizacionRevisionpagosctrlCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(CotizacionRevisionpagosctrlCtrl.awesomeThings.length).toBe(3);
  });
});
