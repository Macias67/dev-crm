'use strict';

describe('Service: TareaAgenda', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var TareaAgenda;
  beforeEach(inject(function (_TareaAgenda_) {
    TareaAgenda = _TareaAgenda_;
  }));

  it('should do something', function () {
    expect(!!TareaAgenda).toBe(true);
  });

});
