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

  function initialize (scope, element) {
    var data = [],
        engines = [];

    if (!scope.basicList && !scope.datasets) {
      return;
    }

    if (scope.basicList) {
      data.push(convertBasicListToDataset(
        scope.basicList,
        scope.defaults.displayKey
      ));

      if (scope.autoBloodhound) {
        engines.push(createDefaultBloodhound(
          scope.basicList,
          scope.defaults.displayKey
        ));
      }
    }

    if (scope.datasets) {
      data = data.concat(scope.datasets);
    }

    if (scope.bloodhounds) {
      engines = engines.concat(scope.bloodhounds);
    }

    if (data.length === engines.length) {
      data = data.map(function (dataset, idx, lst) {
        var engine = engines[idx];
        engine.initialize();
        dataset.source = engine.ttAdapter();
        return dataset;
      });
    } else if (data.length < 1) {
      throw new Error('[angular-twitter-typeahead]: There must be the same number of datasets and engines if you want to use bloodhound.');
    }

    scope.computed.datasets = data;

    destroyTypeahead(element);

    createTypeahead(
      element,
      scope.ttOptions,
      scope.computed.datasets
    );
  }

  mod.controller('TwitterTypeaheadCtrl', [
    '$scope',
    function (
      $scope
    ) {

    $scope.defaults = $scope.defaults || {
      displayKey: 'name'
    };
    $scope.ttOptions = $scope.ttOptions || {
      highlight: true,
      hint: true,
      minLength: 1
    };
    $scope.autoBloodhound = $scope.autoBloodhound || false;
    $scope.placeholder = $scope.placeholder || 'Type to search...';

    $scope.computed = {
      datasets: []
    };
  }]);

  mod.directive('twitterTypeahead', [function () {
    return {
      restrict: 'E',
      require: 'ngModel',
      scope: {
        defaults: '=?',
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
        var input = angular.element(element.children()[0]);

        scope.$watchGroup([
          'basicList',
          'datasets',
          'bloodhounds'
        ], function (newValues, oldValues, scope) {
          initialize(scope, input);
        });

        input.on('keydown', function () {
          scope.$apply(function () {
            ngModelCtrl.$setViewValue(getTypeaheadValue(input));
          });
        });

        input.on('typeahead:selected', function (event, selection, dataset) {
          console.log(selection);
        });

        ngModelCtrl.$render = function () {
          setTypeaheadValue(input, ngModelCtrl.$viewValue);
        };

        ngModelCtrl.$parsers.push(function (viewValue) {
          console.log(ngModelCtrl.$modelValue);
          return viewValue;
        });

        ngModelCtrl.$formatters.push(function (modelValue) {
          if (!modelValue) return modelValue;
          return modelValue[scope.defaults.displayKey];
        });
      }
    };
  }]);

})();