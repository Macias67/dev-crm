'use strict';

describe('Service: Cronometro', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var Cronometro;
  beforeEach(inject(function (_Cronometro_) {
    Cronometro = _Cronometro_;
  }));

  it('should do something', function () {
    expect(!!Cronometro).toBe(true);
  });

});
