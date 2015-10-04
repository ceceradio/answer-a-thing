'use strict';

/**
 * @ngdoc function
 * @name answerAThingApp.controller:RoomController
 * @description
 * # RoomController
 * Controller of the answerAThingApp
 */
angular.module('answerAThingApp')
  .controller('RoomController', function ($scope, drawSocket, gameState) {
    $scope.gameState = gameState;
    $scope.error = false;
    $scope.leaveRoom = function() {
      drawSocket.emit('user.leaveRoom', {});
    };
    $scope.progress = function(data) {
      $scope.drawboard = data;
      drawSocket.emit('user.drawboard', {drawboard: data} );
    };
    $scope.submit = function(data) {
      $scope.drawboard = data;
      drawSocket.emit('user.drawboard', {drawboard: data} );
    };
    drawSocket.on('error', function(error) {
      $scope.error = error;
    });
  });
