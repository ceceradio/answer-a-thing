'use strict';

angular.module('answerAThingApp').
  factory('drawSocket', function (socketFactory) {
    return socketFactory({ ioSocket: io('http://devfluid.com:40001') });
  });
