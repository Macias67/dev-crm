'use strict';

describe('Service: Unidades', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var Unidades;
  beforeEach(inject(function (_Unidades_) {
    Unidades = _Unidades_;
  }));

  it('should do something', function () {
    expect(!!Unidades).toBe(true);
  });

});
