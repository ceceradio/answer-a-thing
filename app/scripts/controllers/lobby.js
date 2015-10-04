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
    $scope.error = false;
    $scope.joinRoom = function(room) {
      drawSocket.emit('user.joinRoom', room);
    };
    drawSocket.on('error', function(error) {
      $scope.error = error;
    });
  });
