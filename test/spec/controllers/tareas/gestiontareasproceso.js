'use strict';

describe('Controller: TareasGestiontareasprocesoctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('MetronicApp'));

  var TareasGestiontareasprocesoctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TareasGestiontareasprocesoctrlCtrl = $controller('TareasGestiontareasprocesoctrlCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(TareasGestiontareasprocesoctrlCtrl.awesomeThings.length).toBe(3);
  });
});
