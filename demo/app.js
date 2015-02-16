(function () {
  'use strict';
  var app = angular.module('demo-twitter-typeahead', [
    'twitter.typeahead'
  ]);

  app.controller('DemoCtrl', function ($scope) {
    $scope.selected = null;

    $scope.searchList = [
      {
        id: 1,
        name: 'Jack'
      },
      {
        id: 2,
        name: 'John'
      },
      {
        id: 2,
        name: 'Jerald'
      }
    ];
  });
})();