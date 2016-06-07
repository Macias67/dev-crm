'use strict';

describe('Service: factory/oficina', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var factory/oficina;
  beforeEach(inject(function (_factory/oficina_) {
    factory/oficina = _factory/oficina_;
  }));

  it('should do something', function () {
    expect(!!factory/oficina).toBe(true);
  });

});
