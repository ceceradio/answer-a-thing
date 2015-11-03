'use strict';

angular.module('answerAThingApp')
  .directive('receiver', function (drawSocket, gameState) {
    return {
      restrict: 'E',
      templateUrl: '/views/receiver.html',
      controller: function($scope) {
        $scope.users = [];
        drawSocket.on('users', function(data) {
          $scope.users = data;
        });
        $scope.gameState = gameState;
      }
    };
  });