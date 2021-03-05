'use strict';

angular.module('timerangeDemo', ['recras.timerange']);

angular.module('timerangeDemo').controller('DemoCtrl', function ($scope, recrasTimerangeViews) {
    // populate some data
    $scope.rangeArray = [
        {value: 0.20, color: 'red'},
        {value: 0.40, color: 'green'},
        {value: 0.66, color: 'blue'},
        {value: 0.80, color: 'yellow'},
        {value: 0.90, color: 'cyan'},
        {value: 0.50, color: 'brown'},
    ];

    $scope.view = recrasTimerangeViews.TIME;

    $scope.add = function () {
        $scope.rangeArray.push({
            value: parseFloat($scope.entry),
            color: $scope.entryColor
        });
    };
});
