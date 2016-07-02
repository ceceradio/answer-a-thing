'use strict';

/**
 * @ngdoc function
 * @name answerAThingApp.controller:RoomController
 * @description
 * # RoomController
 * Controller of the answerAThingApp
 */
angular.module('answerAThingApp')
  .controller('RoomController', function ($scope, drawSocket, gameState, $interval) {
    $scope.gameState = gameState;
    $scope.error = false;
    $scope.leaveRoom = function() {
      drawSocket.emit('room.leave', {});
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
      drawSocket.emit('user.submitAnswer', {});
    };
    $scope.selectQuestion = function(questionIndex) {
      drawSocket.emit('room.selectQuestion', {questionIndex: questionIndex} );
    };
    $scope.selectAnswer = function(username) {
      drawSocket.emit('room.selectAnswer', {username: username});
    };
    $scope.isCaller = function() {
      return gameState.user.hasOwnProperty('room') && gameState.room.hasOwnProperty('caller') && gameState.user.username === gameState.room.caller;
    };
    $scope.cantDraw = function() {
      var cantDrawStates = ['playersBet', 'callerSelectAnswer', 'results'];
      return gameState.room && gameState.room.state && cantDrawStates.indexOf(gameState.room.state.status) > -1;
    };
    $scope.betOnUser = function(username) {
      drawSocket.emit('user.betOnUser', {username: username});
    };
    $scope.clickHandler = function(username) {
      if ($scope.isCaller()) {
        $scope.selectAnswer(username);
      }
      else {
        $scope.betOnUser(username);
      }
    };
    var stop;
    $interval(function() {
      if (gameState.room && gameState.room.state.hasOwnProperty('timerEnd')) {
        $scope.timeLeft = Math.floor((gameState.room.state.timerEnd - Date.now()) / 1000);
      }
      else {
        $scope.timeLeft = 0;
      }
    }, 1000);
    $scope.$on('$destroy', function() {
      if (angular.isDefined(stop)) {
        $interval.cancel(stop);
      }
    });
    $scope.isArray = angular.isArray;
    drawSocket.on('error', function(error) {
      $scope.error = error;
    });
    drawSocket.emit('room.getDrawboards', {});
  });
