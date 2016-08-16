'use strict';

describe('Service: Lider', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var Lider;
  beforeEach(inject(function (_Lider_) {
    Lider = _Lider_;
  }));

  it('should do something', function () {
    expect(!!Lider).toBe(true);
  });

});
