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
        $scope.data = { users: {} };
        drawSocket.on('drawboard', function(data) {
          if ($scope.data.users.hasOwnProperty(data.username)) {
            $scope.data.users[data.username].drawboard = data.drawboard;
          }
        });
        $scope.$watch('gameState.user.room.users', function(users) {
          if (!users)
            return;
          for (var i = 0; i < users.length; i++) {
            if (!$scope.data.users.hasOwnProperty(users[i])) {
              $scope.data.users[users[i]] = {};
              $scope.data.users[users[i]].userIndex = i;
              $scope.data.users[users[i]].drawboard = { image: "", text: {content: "", color: "#000000"} };
            }
          }
          for(var username in $scope.data.users) {
            if (users.indexOf(username) < 0) {
              delete $scope.data.users[username];
            }
          }
        });
        $scope.$watch('gameState.user.room.bets', function(bets) {
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