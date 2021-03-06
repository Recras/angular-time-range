/*
 * multirange.js v0.1.4
 * (c) 2015 Ahmad Ali, ahmadalibaloch@gmail.com
 * (C) 2018-2021 Recras BV
 * License: MIT
 */

'use strict';

angular.module('recras.timerange', ['recras.timerange.lite', 'recras.utils'])
    .directive('recrasTimerange', function () {
        return {
            required: 'ngModel',
            scope: {
                maxValue: '<?',
                ngModel: '=',
                _view: '=view',
            },
            template:
                `<div class="recras-timerange-mk2-container">
                    <recras-timerange-lite ng-model="ngModel" ng-style="renderedStyle.multirange" step="step" max-value="maxValue"></recras-timerange-lite>
                    <recras-timerange-hairlines render="renderedStyle" ng-model="units"></recras-timerange-hairlines>
                </div>`,
            link: function (scope, elem, attr) {
                if (scope.maxValue === undefined) {
                    // Default to the number of minutes in 24 hours, aka a "regular" day
                    // but allow changing this in case of DST
                    scope.maxValue = 1440;
                }

                scope.getPercent = function (value) {
                    return (value * 100) + '%';
                };

                scope.changeView = function (view) {
                    if (typeof view !== 'undefined') {
                        scope.zoom = view.zoom;
                        scope.step = view.step;
                        scope.units = view.units;
                        scope.renderer();
                    }
                };

                scope.$watch('_view', function (v) {
                    scope.changeView(v);
                });

                scope.renderer = function () {
                    if (typeof scope.zoom === 'undefined') {
                        return;
                    }
                    let render = {
                        container: {},
                        content: {},
                        multirange: {
                            width: scope.getPercent(scope.zoom),
                            display: 'block',
                            margin: 'auto'
                        }
                    };

                    if (scope.zoom < 1) {
                        render.content.margin = '2 auto';
                        render.content.width = 'calc(' + scope.getPercent(scope.zoom) + ' - 10px)';
                        render.container.marginLeft = '0';
                    } else {
                        render.content.margin = '2 0';
                        render.content.width = 'calc(' + scope.getPercent(scope.zoom) + ' - ' + (10 - (scope.zoom * 5)) + 'px)';
                        render.container.marginLeft = '5px';
                    }
                    return scope.renderedStyle = render;
                };
            }
        };
    })
    .directive('recrasTimerangeHairlines', function () {
        return {
            restrict: 'E',
            scope: {
                ngModel: '=',
                render: '='
            },
            template:
                `<div class="recras-timerange-mk2-hairlines-container" ng-style="render.container">
                    <ul class="recras-timerange-mk2-hairlines" ng-style="render.content">
                        <li class="recras-timerange-mk2-hairline" ng-repeat="hairline in hairlines" ng-style="hairline.render">
                            <span>{{ hairline.label }}</span>
                        </li>
                    </ul>
                </div>`,
            link: function (scope, elem, attr) {
                scope.$watch('ngModel', function (units) {
                    if (typeof units === 'undefined') {
                        return;
                    }
                    scope.hairlines = [];
                    const levels = units.length;
                    const hairHeight = 12;
                    for (let i = 0; i < levels; i++) {
                        let u = units[i];
                        for (let j = 0; ((j > 1) ? Math.round(j * 1000) / 1000 : j) <= 1; j = parseFloat((j + u.value).toFixed(8))) {
                            let hairline = {
                                render: {
                                    height: hairHeight * (1 - i / levels),
                                    left: (j * 100) + '%'
                                }
                            };
                            if (typeof u.labeller === 'function') {
                                hairline.label = u.labeller(j);
                            } else if (typeof u.labeller !== 'undefined') {
                                hairline.label = j;
                            }
                            scope.hairlines.push(hairline);
                        }
                    }
                });

            }
        };
    })
    .factory('recrasTimerangeViews', function (recrasUtils) {
        const timeView = {
            zoom: 0.95,
            step: 15,
            units: [
                {
                    value: recrasUtils.time.fromTimeToValue(1, 0),
                    labeller: function (n) {
                        let h = recrasUtils.time.fromValueToTime(n).hours;
                        return Math.floor(h % 24) + ':00';
                    }
                },
                {
                    value: recrasUtils.time.fromTimeToValue(0, 15)
                }
            ]
        };
        return {
            TIME: timeView,
        }
    });

angular.module('recras.timerange.lite', [])
    .directive('recrasTimerangeLite', function () {
        return {
            required: 'ngModel',
            scope: {
                maxValue: '<',
                ngModel: '=',
                step: '=',
            },
            template:
                `<div class="recras-timerange-container">
                    <div class="recras-timerange-track"></div>
                    <div class="recras-timerange-wrapper" ng-repeat="range in ngModel">
                        <recras-range class="recras-timerange" ng-model="range.value" min="0" max="{{ maxValue }}" step="{{ step }}">
                    </div>
                </div>`,
            link: function (scope, elem, attr) {
                // Sort by value
                const sortValues = function (a, b) {
                    if (a.value < b.value) {
                        return -1;
                    }
                    if (a.value > b.value) {
                        return 1;
                    }
                    return 0;
                };
                scope.ngModel.sort(sortValues);
                const defaultColor = 'rgb(235, 235, 235)';

                scope.ngModel.map(function (el) {
                    if (!el.color || el.color === "undefined" || el.color.length < 3) {
                        el.color = defaultColor;
                    }
                });
                scope.$watch('ngModel', function (nv, ov) {
                    nv.sort(sortValues);
                    if (angular.equals(nv, ov)) {
                        //return;
                    }
                    // Control the sliders positions
                    let thisSliderVal;
                    let nextSliderVal;
                    let prevSliderVal;
                    let colorArray = [];
                    const sCount = scope.ngModel.length;
                    const colorString = function(value) {
                        return (value / scope.maxValue) * 100 + "%";
                    }
                    for (let i = 0; i < sCount; i++) {
                        thisSliderVal = scope.ngModel[i].value;
                        if (i === 0) {
                            // First
                            nextSliderVal = scope.ngModel[i + 1].value;

                            if (thisSliderVal >= nextSliderVal) {
                                scope.ngModel[i].value = nextSliderVal;
                            }
                            if (thisSliderVal < 0) {
                                scope.ngModel[i].value = 0;
                            }
                            //color
                            colorArray.push(scope.ngModel[i].color + " 0% " + colorString(scope.ngModel[i].value));
                        } else if (i === sCount - 1) {
                            // Last
                            prevSliderVal = scope.ngModel[i - 1].value / scope.maxValue;

                            if (thisSliderVal > scope.maxValue) {
                                scope.ngModel[i].value = scope.maxValue;
                            }
                            if (thisSliderVal <= prevSliderVal) {
                                scope.ngModel[i].value = prevSliderVal;
                            }
                            colorArray.push(scope.ngModel[i].color + " 0% " + colorString(scope.ngModel[i].value));
                            colorArray.push(defaultColor + " " + colorString(scope.ngModel[i].value) + ", " + defaultColor);
                        } else {
                            // Not last or first
                            nextSliderVal = scope.ngModel[i + 1].value;
                            prevSliderVal = scope.ngModel[i - 1].value;

                            if (thisSliderVal >= nextSliderVal) {
                                scope.ngModel[i].value = nextSliderVal;
                            }
                            if (thisSliderVal <= prevSliderVal) {
                                scope.ngModel[i].value = prevSliderVal;
                            }
                            //color
                            colorArray.push(scope.ngModel[i].color + " 0% " + colorString(scope.ngModel[i].value));
                        }
                    }
                    //find track bar div
                    const track = angular.element(elem).find('div')[0].children[0];
                    // Update track bar color
                    angular.element(track).css('background', "linear-gradient(to right, " + colorArray.join(', ') + ")");
                }, true);
            }
        };
    })
    .directive('recrasRange', function () {
        return {
            template: '<input type="range" value="ngModel">',
            restrict: 'E',
            replace: true,
        }
    });

angular.module('recras.utils', [])
    .factory('recrasUtils', function () {
        const dayConst = 24 * 60 * 60 * 1000;
        return {
            time: {
                fromTimeToValue: function (hours, minutes) {
                    let d = new Date(0);
                    d.setUTCHours(hours);
                    d.setUTCMinutes(minutes);
                    return d.getTime() / dayConst;
                },
                fromValueToTime: function (value) {
                    let d = new Date(dayConst * value);
                    return {
                        hours: d.getUTCHours() + ((d.getUTCDate() - 1) * 24),
                        minutes: d.getUTCMinutes()
                    };
                }
            },
        }
    });
