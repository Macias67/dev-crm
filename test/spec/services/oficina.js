'use strict';

describe('Service: Oficina', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var Oficina;
  beforeEach(inject(function (_Oficina_) {
    Oficina = _Oficina_;
  }));

  it('should do something', function () {
    expect(!!Oficina).toBe(true);
  });

});
