'use strict';

describe('Service: Banco', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var Banco;
  beforeEach(inject(function (_Banco_) {
    Banco = _Banco_;
  }));

  it('should do something', function () {
    expect(!!Banco).toBe(true);
  });

});
