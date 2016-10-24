'use strict';

describe('Service: EjecutivoAgenda', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var EjecutivoAgenda;
  beforeEach(inject(function (_EjecutivoAgenda_) {
    EjecutivoAgenda = _EjecutivoAgenda_;
  }));

  it('should do something', function () {
    expect(!!EjecutivoAgenda).toBe(true);
  });

});
