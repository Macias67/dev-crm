'use strict';

/**
 * @ngdoc service
 * @name MetronicApp.Contacto
 * @description
 * # Contacto
 * Factory in the MetronicApp.
 */
angular.module('MetronicApp')
  .factory('Contacto', function () {
    // Service logic
    // ...

    var meaningOfLife = 42;

    // Public API here
    return {
      someMethod: function () {
        return meaningOfLife;
      }
    };
  });
