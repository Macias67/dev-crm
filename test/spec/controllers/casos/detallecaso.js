'use strict';

describe('Controller: CasosDetallecasoCtrl', function () {

  // load the controller's module
  beforeEach(module('MetronicApp'));

  var CasosDetallecasoCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CasosDetallecasoCtrl = $controller('CasosDetallecasoCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(CasosDetallecasoCtrl.awesomeThings.length).toBe(3);
  });
});
