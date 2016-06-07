'use strict';

describe('Service: oficinaservice', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var oficinaservice;
  beforeEach(inject(function (_oficinaservice_) {
    oficinaservice = _oficinaservice_;
  }));

  it('should do something', function () {
    expect(!!oficinaservice).toBe(true);
  });

});
