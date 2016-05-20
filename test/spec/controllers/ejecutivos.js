'use strict';

describe('Controller: EjecutivosCtrl', function () {

  // load the controller's module
  beforeEach(module('devCrmApp'));

  var EjecutivosCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EjecutivosCtrl = $controller('EjecutivosCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(EjecutivosCtrl.awesomeThings.length).toBe(3);
  });
});
