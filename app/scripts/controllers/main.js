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
    $scope.user = { username: '', accessToken: window.localStorage.getItem('accessToken') };
    if (!$scope.user.accessToken) {
      $scope.user.accessToken = Math.floor(Math.random() * 10000000).toString(16);
      console.log($scope.user.accessToken);
    }
    $scope.login = function() {
      drawSocket.emit('login', $scope.user);
    };
    drawSocket.on('user', function() {
      console.log('hello');
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
      $scope.imageData = data;
      drawSocket.emit('image', {imageData: data} );
    };
    $scope.submit = function(data) {
      if(!$scope.loggedIn) {
        return;
      }
      $scope.imageData = data;
      drawSocket.emit('image', {imageData: data} );
    };
  });
