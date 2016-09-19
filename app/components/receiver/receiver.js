'use strict';

angular.module('answerAThingApp')
  .directive('receiver', function (drawSocket, gameState, drawboardService) {
    return {
      restrict: 'E',
      scope: {
        clickHandler: '='
      },
      templateUrl: '/components/receiver/receiver.html?'+Date.now(),
      controller: function($scope) {
        $scope.data = { users: {} };
        var listener = function(data) {
          if (!$scope.gameState.room) return;
          for (var i in $scope.gameState.room.users) {
            if ($scope.gameState.room.users[i].username === data.username) {
              $scope.gameState.room.users[i].drawboard = data.drawboard;  
            }
          }
        };
        drawboardService.addListener(listener);
        $scope.$on('$destroy', function() {
          drawboardService.removeListener(listener);
        });
        // @TODO
        $scope.$watch('gameState.room.bets', function(bets) {
          for (var username in bets) {
            if ($scope.data.users.hasOwnProperty(username)) {
              $scope.data.users[username].bets = bets[username];
            }
          }
        });
        $scope.gameState = gameState;
      }
    };
  });