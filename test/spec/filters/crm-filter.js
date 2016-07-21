'use strict';

describe('Filter: crmFilter', function () {

  // load the filter's module
  beforeEach(module('MetronicApp'));

  // initialize a new instance of the filter before each test
  var crmFilter;
  beforeEach(inject(function ($filter) {
    crmFilter = $filter('crmFilter');
  }));

  it('should return the input prefixed with "crmFilter filter:"', function () {
    var text = 'angularjs';
    expect(crmFilter(text)).toBe('crmFilter filter: ' + text);
  });

});
