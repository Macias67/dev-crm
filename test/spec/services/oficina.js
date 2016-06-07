'use strict';

describe('Service: oficina', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var oficina;
  beforeEach(inject(function (_oficina_) {
    oficina = _oficina_;
  }));

  it('should do something', function () {
    expect(!!oficina).toBe(true);
  });

});
