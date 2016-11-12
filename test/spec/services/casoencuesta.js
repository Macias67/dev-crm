'use strict';

describe('Service: CasoEncuesta', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var CasoEncuesta;
  beforeEach(inject(function (_CasoEncuesta_) {
    CasoEncuesta = _CasoEncuesta_;
  }));

  it('should do something', function () {
    expect(!!CasoEncuesta).toBe(true);
  });

});
