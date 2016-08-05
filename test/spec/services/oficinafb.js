'use strict';

describe('Service: OficinaFB', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var OficinaFB;
  beforeEach(inject(function (_OficinaFB_) {
    OficinaFB = _OficinaFB_;
  }));

  it('should do something', function () {
    expect(!!OficinaFB).toBe(true);
  });

});
