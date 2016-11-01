'use strict';

describe('Filter: duracion', function () {

  // load the filter's module
  beforeEach(module('MetronicApp'));

  // initialize a new instance of the filter before each test
  var duracion;
  beforeEach(inject(function ($filter) {
    duracion = $filter('duracion');
  }));

  it('should return the input prefixed with "duracion filter:"', function () {
    var text = 'angularjs';
    expect(duracion(text)).toBe('duracion filter: ' + text);
  });

});
