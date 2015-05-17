'use strict';

angular.module('answerAThingApp')
  .directive('receiver', function (drawSocket) {
    return {
      restrict: 'E',
      templateUrl: '/scripts/receiver/receiver.html',
      controller: function($scope) {
        $scope.images = [];
        drawSocket.on('users', function(data) {
          console.log(data);
          $scope.images = data;
        });
      }
    };
  });