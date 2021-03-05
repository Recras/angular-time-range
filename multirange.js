/*
 * multirange.js v0.1.4
 * (c) 2015 Ahmad Ali, ahmadalibaloch@gmail.com
 * (C) 2018-2021 Recras BV
 * License: MIT
 */

'use strict';

angular.module('recras.timerange', ['recras.timerange.lite', 'recras.utils'])
    .directive('recrasTimerange', function (recrasTimerangeViews) {
        return {
            required: 'ngModel',
            scope: {
                ngModel: '=',
                _views: '=views',
                _view: '=view',
            },
            template:
                `<div class="recras-timerange-mk2-container">
                    <recras-timerange-lite ng-model="ngModel" ng-style="renderedStyle.multirange" step="step"></recras-timerange-lite>
                    <recras-timerange-hairlines render="renderedStyle" ng-model="units"></recras-timerange-hairlines>
                </div>`,
            link: function (scope, elem, attr) {
                scope.getPercent = function (value) {
                    return (value * 100) + '%';
                };

                scope.changeView = function (n) {
                    if (typeof n === 'undefined' || typeof scope.views === 'undefined') {
                        return;
                    }
                    const viewCount = scope.views.length - 1;
                    n = (n < 0) ? 0 : ((n > viewCount) ? viewCount : n);
                    let view = scope.views[n];
                    if (typeof view !== 'undefined') {
                        scope.zoom = view.zoom;
                        scope.step = view.step;
                        scope.units = view.units;
                        scope.renderer();
                    }
                };

                scope.$watch('_view', function (n) {
                    scope.changeView(n);
                });

                scope.$watch('_views', function (views) {
                    scope.views = views;
                    scope.view = 0;
                    scope.changeView(0);
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

                // set default view config
                if (typeof scope.views === 'undefined') {
                    scope.views = recrasTimerangeViews.DEFAULT;
                    scope.view = 0;
                    scope.changeView(0);
                }

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
                scope.$watch('ngModel', function (n) {
                    if (typeof n === 'undefined') {
                        return;
                    }
                    scope.hairlines = [];
                    const levels = n.length;
                    const hairHeight = 12;
                    for (let i = 0; i < levels; i++) {
                        let u = n[i];
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
        const tv = recrasUtils.time.fromTimeToValue;
        const vt = recrasUtils.time.fromValueToTime;
        const pad = recrasUtils.format.padZeroes;
        return {
            TIME: [
                {
                    zoom: 0.9, step: tv(0, 15), units: [
                        {
                            value: tv(1, 0), labeller: function (n) {
                                return vt(n).hours + 'h'
                            }
                        },
                        {value: tv(0, 30)}
                    ]
                },
                {
                    zoom: 1.2, step: tv(0, 10), units: [
                        {
                            value: tv(1, 0), labeller: function (n) {
                                return vt(n).hours + 'h'
                            }
                        },
                        {value: tv(0, 30)}
                    ]
                },
                {
                    zoom: 1.4, step: tv(0, 6), units: [
                        {
                            value: tv(1, 0), labeller: function (n) {
                                return vt(n).hours + 'h'
                            }
                        },
                        {value: tv(0, 30)},
                        {value: tv(0, 12)}
                    ]
                },
                {
                    zoom: 3.4, step: tv(0, 1), units: [
                        {value: tv(1, 0)},
                        {
                            value: tv(0, 15), labeller: function (n) {
                                const h = vt(n).hours;
                                const m = vt(n).minutes;
                                return (m == 0) ? h + 'h' : h + ':' + pad(m, 2);
                            }
                        },
                        {value: tv(0, 5)}
                    ]
                }
            ],
            DEFAULT: [
                {
                    zoom: 0.9, step: 1 / 40, units: [{
                        value: 1 / 10, labeller: function (n) {
                            return n * 10
                        }
                    }, {value: 1 / 20,}]
                },
                {
                    zoom: 1.5, step: 1 / 80, units: [{
                        value: 1 / 20, labeller: function (n) {
                            return n * 10
                        }
                    }, {value: 1 / 40,}]
                }
            ]
        }
    });

angular.module('recras.timerange.lite', [])
    .directive('recrasTimerangeLite', function () {
        return {
            required: 'ngModel',
            scope: {
                ngModel: '=',
                step: '=',
            },
            template:
                `<div class="recras-timerange-container">
                    <div class="recras-timerange-track"></div>
                    <div class="recras-timerange-wrapper" ng-repeat="range in ngModel">
                        <recras-range class="recras-timerange" position="range.value" min="0" max="{{ precision }}" step="{{ preciseStep }}">
                    </div>
                </div>`,
            link: function (scope, elem, attr) {
                scope.precision = 1000000;
                scope.preciseStep = 1;
                scope.$watch('step', function () {
                    if (typeof scope.step === 'undefined') {
                        scope.preciseStep = 1;
                    } else {
                        scope.preciseStep = scope.step * scope.precision;
                    }
                });
                //Multi-Color
                //Sort by value
                scope.ngModel.sort(function (a, b) {
                    if (a.value < b.value) {
                        return -1;
                    }
                    if (a.value > b.value) {
                        return 1;
                    }
                    return 0;
                });

                //===========================================
                const defaultColor = "rgb(235, 235, 235)";
                //
                scope.ngModel.map(function (el) {
                    if (!el.color || el.color === "undefined" || el.color.length < 3) el.color = defaultColor;
                });
                scope.$watch('ngModel', function (nv, ov) {
                    if (angular.equals(nv, ov)) {
                        return;
                    }
                    // Control the sliders positions
                    let thisSliderVal;
                    let nextSliderVal;
                    let prevSliderVal;
                    let colorString = "";
                    const sCount = scope.ngModel.length;
                    for (let i = 0; i < sCount; i++) {
                        thisSliderVal = scope.ngModel[i].value;
                        if (i < (sCount - 1) && i > 0) {//not last or first
                            nextSliderVal = scope.ngModel[i + 1].value;
                            prevSliderVal = scope.ngModel[i - 1].value;

                            if (thisSliderVal >= nextSliderVal) {
                                scope.ngModel[i].value = nextSliderVal;
                            }
                            if (thisSliderVal <= prevSliderVal) {
                                scope.ngModel[i].value = prevSliderVal;
                            }
                            //color
                            colorString += scope.ngModel[i].color + " " + scope.ngModel[i - 1].value * 100 + "%," + scope.ngModel[i].color + " " + scope.ngModel[i].value * 100 + "%,";
                        } else if (i === 0) {//first
                            nextSliderVal = scope.ngModel[i + 1].value;

                            if (thisSliderVal >= nextSliderVal) {
                                scope.ngModel[i].value = nextSliderVal;
                            }
                            if (thisSliderVal <= 0) {
                                scope.ngModel[i].value = 0;
                            }
                            //color
                            colorString += scope.ngModel[i].color + " 0%," + scope.ngModel[i].color + " " + scope.ngModel[i].value * 100 + "%,";
                        } else if (i === sCount - 1) {//last
                            prevSliderVal = scope.ngModel[i - 1].value;

                            if (thisSliderVal >= scope.MAX_VALUE) {
                                scope.ngModel[i].value = scope.MAX_VALUE;
                            }
                            if (thisSliderVal <= prevSliderVal) {
                                scope.ngModel[i].value = prevSliderVal;
                            }
                            colorString += scope.ngModel[i].color + " " + scope.ngModel[i - 1].value * 100 + "%," + scope.ngModel[i].color + " " + scope.ngModel[i].value * 100 + "%,";
                            colorString += defaultColor + " " + scope.ngModel[i].value * 100 + "%," + defaultColor;
                        }
                    }
                    //find track bar div
                    const track = angular.element(elem).find('div')[0].children[0];
                    // Update track bar color
                    colorString = colorString.substring(0, colorString.length - 1);
                    angular.element(track).css('background', "linear-gradient(to right, " + colorString + ")");
                }, true);
            }
        };
    })
    .directive('recrasRange', function ($timeout) {
        return {
            template: '<input type="range" ng-model="rdh.mulValue">',
            restrict: 'E',
            replace: true,
            scope: {
                position: '='
            },
            link: function (scope, elem, attr) {
                const RangeDataHelper = function (value, multiplier) {
                    this.value = isNaN(value) ? 0 : value;
                    this.multiplier = multiplier;
                    Object.defineProperty(this, 'mulValue', {
                        get: function () {
                            return (parseFloat(this.value) * this.multiplier) + '';
                        },
                        set: function (n) {
                            this.value = parseInt(n) / this.multiplier;
                            scope.position = this.value;
                        }
                    });
                };
                scope.$watch('position', function (n) {
                    if (typeof scope.rdh === 'undefined') {
                        scope.rdh = new RangeDataHelper(n, parseInt(attr.max) || 100);
                    } else {
                        // scope.rdh.multiplier = parseInt(attr.max) || 100;
                        scope.rdh.value = n;
                    }
                });
            }
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
            format: {
                padZeroes: function (num, size) {
                    return num.padStart(size, '0');
                }
            }
        }
    });
