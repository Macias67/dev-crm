'use strict';

describe('Controller: CasosCasosporasignarctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('MetronicApp'));

  var CasosCasosporasignarctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CasosCasosporasignarctrlCtrl = $controller('CasosCasosporasignarctrlCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(CasosCasosporasignarctrlCtrl.awesomeThings.length).toBe(3);
  });
});
