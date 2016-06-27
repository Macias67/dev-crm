'use strict';

describe('Controller: ClientesPerfilclientectrlCtrl', function () {

  // load the controller's module
  beforeEach(module('MetronicApp'));

  var ClientesPerfilclientectrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ClientesPerfilclientectrlCtrl = $controller('ClientesPerfilclientectrlCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ClientesPerfilclientectrlCtrl.awesomeThings.length).toBe(3);
  });
});
