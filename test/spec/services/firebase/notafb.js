'use strict';

describe('Service: firebase/NotaFB', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var firebase/NotaFB;
  beforeEach(inject(function (_firebase/NotaFB_) {
    firebase/NotaFB = _firebase/NotaFB_;
  }));

  it('should do something', function () {
    expect(!!firebase/NotaFB).toBe(true);
  });

});
