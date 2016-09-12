'use strict';

describe('Service: Tarea', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var Tarea;
  beforeEach(inject(function (_Tarea_) {
    Tarea = _Tarea_;
  }));

  it('should do something', function () {
    expect(!!Tarea).toBe(true);
  });

});
