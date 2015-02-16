(function () {
  'use strict';
  var app = angular.module('demo-twitter-typeahead', [
    'twitter.typeahead'
  ]);

  app.controller('DemoCtrl', function ($scope) {
    $scope.defaultSelected = null;
    $scope.defaultSearchList = [
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

    $scope.defaultSelected2 = null;
    $scope.defaultSearchList2 = [
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

    $scope.defaultBloodhoundSelected = null;
    $scope.defaultBloodhoundSearchList = [
      {
        id: 1,
        firstName: 'Jack'
      },
      {
        id: 2,
        firstName: 'John'
      },
      {
        id: 2,
        firstName: 'Jerald'
      }
    ];
    $scope.basicOptions = {
      displayKey: 'firstName',
      clearOnSelect: true
    };
    $scope.ttBasicOptions = {
      highlight: false,
      hint: false,
      minLength: 2
    };
    $scope.basicLabel = 'custom-label'
    $scope.$on('custom-label-typeahead:updated', function (event, selection) {
      console.log('Captured custom label typeahead update event: ' + selection[$scope.basicOptions.displayKey]);
    });
  });
})();