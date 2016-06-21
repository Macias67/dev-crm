'use strict';

describe('Controller: ClientesGestionclientesctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('MetronicApp'));

  var ClientesGestionclientesctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ClientesGestionclientesctrlCtrl = $controller('ClientesGestionclientesctrlCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ClientesGestionclientesctrlCtrl.awesomeThings.length).toBe(3);
  });
});
