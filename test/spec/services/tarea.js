'use strict';

describe('Service: tarea', function () {

  // load the service's module
  beforeEach(module('MetronicApp'));

  // instantiate service
  var tarea;
  beforeEach(inject(function (_tarea_) {
    tarea = _tarea_;
  }));

  it('should do something', function () {
    expect(!!tarea).toBe(true);
  });

});
