'use strict';

describe('Controller: CasosGestioncasosCtrl', function () {

  // load the controller's module
  beforeEach(module('MetronicApp'));

  var CasosGestioncasosCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CasosGestioncasosCtrl = $controller('CasosGestioncasosCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(CasosGestioncasosCtrl.awesomeThings.length).toBe(3);
  });
});
