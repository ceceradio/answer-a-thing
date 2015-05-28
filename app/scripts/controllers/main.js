'use strict';

/**
 * @ngdoc function
 * @name answerAThingApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the answerAThingApp
 */
angular.module('answerAThingApp')
  .controller('MainCtrl', function ($scope, drawSocket) {
    $scope.loggedIn = false;
    $scope.user = { username: window.localStorage.getItem('username'), accessToken: window.localStorage.getItem('accessToken') };
    if (!$scope.user.accessToken) {
      $scope.user.accessToken = CryptoJS.SHA3(CryptoJS.lib.WordArray.random(1024)).toString(CryptoJS.enc.Base64);
      window.localStorage.setItem('accessToken', $scope.user.accessToken);
    }
    $scope.login = function() {
      window.localStorage.setItem('username', $scope.user.username);
      drawSocket.emit('login', $scope.user);
    };
    drawSocket.on('user', function() {
      $scope.loggedIn = true;
    });
    drawSocket.on('logout', function(error) {
      console.log(error);
      $scope.loggedIn = false;
    });
    $scope.progress = function(data) {
      if(!$scope.loggedIn) {
        return;
      }
      $scope.drawboard = data;
      drawSocket.emit('drawboard', {drawboard: data} );
    };
    $scope.submit = function(data) {
      if(!$scope.loggedIn) {
        return;
      }
      $scope.drawboard = data;
      drawSocket.emit('drawboard', {drawboard: data} );
    };

    if ($scope.user.username) {
      $scope.login();
    }
  });
