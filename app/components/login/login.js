'use strict';

/**
 * @ngdoc function
 * @name answerAThingApp.controller:LoginController
 * @description
 * # LoginController
 * Controller of the answerAThingApp
 */
angular.module('answerAThingApp')
  .controller('LoginController', function ($scope, drawSocket, gameState) {
    $scope.user = gameState.user;
    $scope.error = false;
    $scope.login = function() {
      window.localStorage.setItem('username', $scope.user.username);
      drawSocket.emit('user.login', $scope.user);
    };
    if ($scope.user.username) {
      $scope.login();
    }
  });
