'use strict';

describe('Service: Pago', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var Pago;
  beforeEach(inject(function (_Pago_) {
    Pago = _Pago_;
  }));

  it('should do something', function () {
    expect(!!Pago).toBe(true);
  });

});
