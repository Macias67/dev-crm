'use strict';

describe('Controller: TareasGestiontareasctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('MetronicApp'));

  var TareasGestiontareasctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TareasGestiontareasctrlCtrl = $controller('TareasGestiontareasctrlCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(TareasGestiontareasctrlCtrl.awesomeThings.length).toBe(3);
  });
});
