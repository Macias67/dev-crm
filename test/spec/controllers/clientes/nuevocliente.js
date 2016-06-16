'use strict';

describe('Controller: ClientesNuevoclientectrlCtrl', function () {

  // load the controller's module
  beforeEach(module('MetronicApp'));

  var ClientesNuevoclientectrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ClientesNuevoclientectrlCtrl = $controller('ClientesNuevoclientectrlCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ClientesNuevoclientectrlCtrl.awesomeThings.length).toBe(3);
  });
});
