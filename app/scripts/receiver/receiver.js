'use strict';

angular.module('answerAThingApp')
  .directive('receiver', function (drawSocket, gameState) {
    return {
      restrict: 'E',
      scope: {
        clickHandler: '='
      },
      templateUrl: '/views/receiver.html',
      controller: function($scope) {
        $scope.users = [];
        drawSocket.on('users', function(data) {
          $scope.users = data;
        });
        $scope.getDrawboard = function(username) {
          for(var i = 0; i < $scope.users.length; i++) {
            if ($scope.users[i].username == username)
              return $scope.users[i].drawboard; 
          }
          return "";
        };
        $scope.gameState = gameState;
      }
    };
  });