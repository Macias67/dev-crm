'use strict';

describe('Service: NotifService', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var NotifService;
  beforeEach(inject(function (_NotifService_) {
    NotifService = _NotifService_;
  }));

  it('should do something', function () {
    expect(!!NotifService).toBe(true);
  });

});
