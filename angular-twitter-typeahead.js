(function () {
  'use strict';

  var mod = angular.module('twitter.typeahead', []);

  function createTypeahead (element, options, datasets) {
    element.typeahead(options, datasets);
  }

  function destroyTypeahead (element) {
    element.typeahead('destroy');
  }

  function openTypeahead (element) {
    element.typeahead('open');
  }

  function closeTypeahead (element) {
    element.typeahead('close');
  }

  function getTypeaheadValue (element) {
    return element.typeahead('val');
  }

  function setTypeaheadValue (element, value) {
    element.typeahead('val', value);
  }

  function searchObjectArrayByKey (array, key, value) {
    var arrayLength = array.length,
        current;

    while (arrayLength--) {
      current = array[arrayLength];
      if (current[key] == value) return value;
    }

    return null;
  }

  function defaultSource (list, displayKey) {
    return function (query, callback) {
      return callback(searchObjectArrayByKey(list, displayKey, query));
    };
  }

  function convertBasicListToDataset (list, displayKey) {
    return {
      name: 'default-dataset',
      source: defaultSource(list, displayKey),
      displayKey: displayKey
    };
  }

  function createDefaultBloodhound (list, displayKey) {
    return new Bloodhound({
      datumTokenizer: function (datum) {
        return Bloodhound.tokenizers.whitespace(datum[displayKey]);
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: list
    });
  }

  function searchDatasets (value, datasets) {
    var dLen = datasets.length,
        current,
        aggregateResults = [];

    while (dLen--) {
      current = datasets[dLen];
      current.source(value, function (results) {
        aggregateResults = aggregateResults.concat(results);
      });
    }

    return aggregateResults;
  }

  mod.controller('TwitterTypeaheadCtrl', [
    '$scope',
    function (
      $scope
    ) {

    $scope.label = $scope.label || 'default';
    $scope.localOptions = $scope.localOptions || {
      displayKey: 'name',
      clearOnSelect: false
    };
    $scope.ttOptions = $scope.ttOptions || {
      highlight: true,
      hint: true,
      minLength: 1
    };
    $scope.autoBloodhound = $scope.autoBloodhound || false;
    $scope.placeholder = $scope.placeholder || 'Type to search...';

    $scope.computed = {
      datasets: [],
      engines: []
    };

    $scope._normalizeBasics = function () {
      if ($scope.basicList) {
        $scope.computed.datasets.push(convertBasicListToDataset(
          $scope.basicList,
          $scope.localOptions.displayKey
        ));

        if ($scope.autoBloodhound) {
          $scope.computed.engines.push(createDefaultBloodhound(
            $scope.basicList,
            $scope.localOptions.displayKey
          ));
        }
      }
    };

    $scope._mapEnginesToDatasets = function () {
      if ($scope.datasets) {
        $scope.computed.datasets = $scope.computed.datasets.concat($scope.datasets);
      }

      if ($scope.bloodhounds) {
        $scope.computed.engines = $scope.computed.engines.concat($scope.bloodhounds);
      }

      if ($scope.computed.datasets.length === $scope.computed.engines.length) {
        $scope.computed.datasets = $scope.computed.datasets.map(function (dataset, idx, lst) {
          var engine = $scope.computed.engines[idx];
          engine.initialize();
          dataset.source = engine.ttAdapter();
          return dataset;
        });
      } else if ($scope.computed.datasets.length < 1) {
        throw new Error('[angular-twitter-typeahead]: There must be the same number of datasets and engines if you want to use bloodhound.');
      }
    };

    $scope._initialize = function () {
      if (!$scope.basicList && !$scope.datasets) {
        return;
      }

      $scope._normalizeBasics();
      $scope._mapEnginesToDatasets();
    };
  }]);

  mod.directive('twitterTypeahead', [function () {
    return {
      restrict: 'E',
      require: 'ngModel',
      scope: {
        label: '=?',
        localOptions: '=?',
        basicList: '=?',
        datasets: '=?',
        ttOptions: '=?',
        autoBloodhound: '=?',
        bloodhounds: '=?',
        placeholder: '@?'
      },
      controller: 'TwitterTypeaheadCtrl',
      template: '<input type="text" placeholder="{{ placeholder }}"></input>',
      link: function postLink (scope, element, attrs, ngModelCtrl) {
        var input = angular.element(element.children()[0]).typeahead();

        scope.$watchGroup([
          'basicList',
          'datasets',
          'bloodhounds'
        ], function (newValues, oldValues, scope) {
          scope._initialize();
          destroyTypeahead(input);
          createTypeahead(
            input,
            scope.ttOptions,
            scope.computed.datasets
          );
        });

        // Ensure handles initial ng-model bindings correctly

        input.on('typeahead:selected', function (event, selection, dataset) {
          if (!scope.localOptions.clearOnSelect) {
            ngModelCtrl.$setViewValue(selection);
          }

          ngModelCtrl.$render();
          scope.$emit(scope.label + '-typeahead:updated', selection);
        });

        ngModelCtrl.$render = function () {
          if (ngModelCtrl.$isEmpty(ngModelCtrl.$viewValue)) {
            setTypeaheadValue(input, '');
          } else {
            setTypeaheadValue(input, ngModelCtrl.$viewValue[scope.localOptions.displayKey]);
          }
        };

        ngModelCtrl.$parsers.push(function (viewValue) {
          if (!angular.isObject(viewValue)) return null;
          return viewValue;
        });

        ngModelCtrl.$formatters.push(function (modelValue) {
          if (!angular.isObject(modelValue)) return null;
          return modelValue;
        });
      }
    };
  }]);

})();