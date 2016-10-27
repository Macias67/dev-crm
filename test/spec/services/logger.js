'use strict';

describe('Service: Logger', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var Logger;
  beforeEach(inject(function (_Logger_) {
    Logger = _Logger_;
  }));

  it('should do something', function () {
    expect(!!Logger).toBe(true);
  });

});
