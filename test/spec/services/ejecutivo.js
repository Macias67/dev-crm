'use strict';

describe('Service: Ejecutivo', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var Ejecutivo;
  beforeEach(inject(function (_Ejecutivo_) {
    Ejecutivo = _Ejecutivo_;
  }));

  it('should do something', function () {
    expect(!!Ejecutivo).toBe(true);
  });

});
