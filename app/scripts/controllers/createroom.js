'use strict';

/**
 * @ngdoc function
 * @name answerAThingApp.controller:CreateRoomController
 * @description
 * # CreateRoomController
 * Controller of the answerAThingApp
 */
angular.module('answerAThingApp')
  .controller('CreateRoomController', function ($scope, drawSocket, gameState) {
    $scope.user = gameState.user;
    $scope.room = {name: "", password: ""};
    $scope.error = false;
    $scope.createRoom = function() {
      drawSocket.emit('joinRoom', $scope.room);
    };
    drawSocket.on('error', function(error) {
      $scope.error = error;
    });
  });
