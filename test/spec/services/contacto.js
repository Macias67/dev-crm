'use strict';

describe('Service: Contacto', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var Contacto;
  beforeEach(inject(function (_Contacto_) {
    Contacto = _Contacto_;
  }));

  it('should do something', function () {
    expect(!!Contacto).toBe(true);
  });

});
