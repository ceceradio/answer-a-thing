'use strict';

angular.module('answerAThingApp')
  .directive('receiver', function (drawSocket) {
    return {
      restrict: 'E',
      templateUrl: '/scripts/receiver/receiver.html',
      controller: function($scope) {
        $scope.users = [];
        drawSocket.on('users', function(data) {
          $scope.users = data;
        });
      }
    };
  });