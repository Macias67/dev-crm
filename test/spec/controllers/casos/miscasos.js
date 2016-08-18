'use strict';

describe('Controller: CasosMiscasosctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('MetronicApp'));

  var CasosMiscasosctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CasosMiscasosctrlCtrl = $controller('CasosMiscasosctrlCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(CasosMiscasosctrlCtrl.awesomeThings.length).toBe(3);
  });
});
