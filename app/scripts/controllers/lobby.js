'use strict';

/**
 * @ngdoc function
 * @name answerAThingApp.controller:LobbyController
 * @description
 * # LobbyController
 * Controller of the answerAThingApp
 */
angular.module('answerAThingApp')
  .controller('LobbyController', function ($scope, drawSocket, gameState, $location) {
    $scope.$location = $location;
    $scope.gameState = gameState;
    $scope.user = gameState.user;
    $scope.data = { password: '', form: '' };
    $scope.logout = function() {
      drawSocket.emit('user.logout', {});
    };
    $scope.joinRoom = function(room) {
      if (room.password && !$scope.data.password) {
        $scope.data.form = room.name;
        $("#pw-"+room.$$hashKey).focus();
      }
      else if (room.password && $scope.data.password) {
        drawSocket.emit('user.joinRoom', angular.extend({}, room, $scope.data)); 
      }
      else {
        drawSocket.emit('user.joinRoom', room);  
      }
    };
  });
