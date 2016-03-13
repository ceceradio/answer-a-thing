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
    $scope.selectAnswer = function(username) {
      drawSocket.emit('room.selectAnswer', {username: username});
    };
    $scope.isCaller = function() {
      return gameState.user.hasOwnProperty('room') && gameState.user.room.hasOwnProperty('caller') && gameState.user.username === gameState.user.room.caller;
    };
    $scope.cantDraw = function() {
      var cantDrawStates = ['playersBet', 'callerSelectAnswer', 'results'];
      return gameState.user.hasOwnProperty('room') && cantDrawStates.indexOf(gameState.user.room.state.status) > -1;
    };
    $scope.betOnUser = function(username) {
      drawSocket.emit('room.betOnUser', {username: username});
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
      if (gameState.user.room && gameState.user.room.state.timerEnd) {
        $scope.timeLeft = Math.floor((gameState.user.room.state.timerEnd - Date.now()) / 1000);
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
