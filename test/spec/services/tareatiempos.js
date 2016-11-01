'use strict';

describe('Service: TareaTiempos', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var TareaTiempos;
  beforeEach(inject(function (_TareaTiempos_) {
    TareaTiempos = _TareaTiempos_;
  }));

  it('should do something', function () {
    expect(!!TareaTiempos).toBe(true);
  });

});
