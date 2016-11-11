'use strict';

describe('Controller: ClienteEncuestaEncuestactrlCtrl', function () {

  // load the controller's module
  beforeEach(module('MetronicApp'));

  var ClienteEncuestaEncuestactrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ClienteEncuestaEncuestactrlCtrl = $controller('ClienteEncuestaEncuestactrlCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ClienteEncuestaEncuestactrlCtrl.awesomeThings.length).toBe(3);
  });
});
