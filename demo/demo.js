'use strict';

angular.module('timerangeDemo', ['recras.timerange']);

angular.module('timerangeDemo').controller('DemoCtrl', function ($scope, recrasTimerangeViews) {
    // populate some data
    $scope.rangeArray = [
        {value: 0, color: '#000000'}, // Color at 0 does nothing
        {value: 1290, color: '#ee4411'}, // Out of order values are sorted
        {value: 570, color: '#00cc00'},
        {value: 945, color: '#000080'},
        {value: 1155, color: '#ffcc00'},
    ];

    $scope.entry = 720;
    $scope.entryColor = '#2baff7';

    $scope.view = recrasTimerangeViews.TIME;

    $scope.add = function () {
        $scope.rangeArray.push({
            value: $scope.entry,
            color: $scope.entryColor
        });
    };
});
