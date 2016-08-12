'use strict';

describe('Service: Caso', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var Caso;
  beforeEach(inject(function (_Caso_) {
    Caso = _Caso_;
  }));

  it('should do something', function () {
    expect(!!Caso).toBe(true);
  });

});
