'use strict';

angular.module('answerAThingApp').
  factory('drawSocket', function (socketFactory) {
    return socketFactory({ ioSocket: io('http://localhost:3000') });
  });
