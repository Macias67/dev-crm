'use strict';

describe('Service: Cotizacion', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var Cotizacion;
  beforeEach(inject(function (_Cotizacion_) {
    Cotizacion = _Cotizacion_;
  }));

  it('should do something', function () {
    expect(!!Cotizacion).toBe(true);
  });

});
