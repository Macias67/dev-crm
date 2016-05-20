'use strict';

describe('Controller: GestorGeneralOficinasCtrl', function () {

  // load the controller's module
  beforeEach(module('devCrmApp'));

  var GestorGeneralOficinasCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GestorGeneralOficinasCtrl = $controller('GestorGeneralOficinasCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(GestorGeneralOficinasCtrl.awesomeThings.length).toBe(3);
  });
});
