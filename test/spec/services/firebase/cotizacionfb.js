'use strict';

describe('Service: firebase/CotizacionFB', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var firebase/CotizacionFB;
  beforeEach(inject(function (_firebase/CotizacionFB_) {
    firebase/CotizacionFB = _firebase/CotizacionFB_;
  }));

  it('should do something', function () {
    expect(!!firebase/CotizacionFB).toBe(true);
  });

});
