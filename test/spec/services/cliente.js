'use strict';

describe('Service: Cliente', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var Cliente;
  beforeEach(inject(function (_Cliente_) {
    Cliente = _Cliente_;
  }));

  it('should do something', function () {
    expect(!!Cliente).toBe(true);
  });

});
