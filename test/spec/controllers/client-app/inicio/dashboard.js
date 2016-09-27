'use strict';

describe('Controller: ClientAppInicioDashboardCtrl', function () {

  // load the controller's module
  beforeEach(module('MetronicApp'));

  var ClientAppInicioDashboardCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ClientAppInicioDashboardCtrl = $controller('ClientAppInicioDashboardCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ClientAppInicioDashboardCtrl.awesomeThings.length).toBe(3);
  });
});
