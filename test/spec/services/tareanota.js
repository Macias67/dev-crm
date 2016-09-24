'use strict';

describe('Service: tareanota', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var tareanota;
  beforeEach(inject(function (_tareanota_) {
    tareanota = _tareanota_;
  }));

  it('should do something', function () {
    expect(!!tareanota).toBe(true);
  });

});
