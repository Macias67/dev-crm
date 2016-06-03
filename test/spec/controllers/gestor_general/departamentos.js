'use strict';

describe('Controller: GestorGeneralDepartamentosCtrl', function () {

  // load the controller's module
  beforeEach(module('MetronicApp'));

  var GestorGeneralDepartamentosCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GestorGeneralDepartamentosCtrl = $controller('GestorGeneralDepartamentosCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(GestorGeneralDepartamentosCtrl.awesomeThings.length).toBe(3);
  });
});
