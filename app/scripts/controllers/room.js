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
    $scope.startGame = function() {
      drawSocket.emit('room.startGame', {});
    };
    $scope.progress = function(data) {
      $scope.drawboard = data;
      drawSocket.emit('user.drawboard', {drawboard: data} );
    };
    $scope.submit = function(data) {
      $scope.drawboard = data;
      drawSocket.emit('user.drawboard', {drawboard: data} );
      drawSocket.emit('room.submitAnswer', {});
    };
    $scope.selectQuestion = function(questionIndex) {
      drawSocket.emit('room.selectQuestion', {questionIndex: questionIndex} );
    };
    $scope.selectAnswer = function(userIndex) {
      drawSocket.emit('room.selectAnswer', {userIndex: userIndex});
    };
    $scope.isCaller = function() {
      return gameState.user.username === gameState.user.room.caller;
    };
    $scope.cantDraw = function() {
      var cantDrawStates = ['playersBet', 'callerSelectAnswer', 'results'];
      return cantDrawStates.indexOf(gameState.user.room.state.status) > -1;
    };
    $scope.betOnUser = function(userIndex) {
      drawSocket.emit('room.betOnUser', {userIndex: userIndex});
    };
    $scope.clickHandler = function(userIndex) {
      if ($scope.isCaller()) {
        $scope.selectAnswer(userIndex);
      }
      else {
        $scope.betOnUser(userIndex);
      }
    };
    $scope.isArray = angular.isArray;
    drawSocket.on('error', function(error) {
      $scope.error = error;
    });
  });
