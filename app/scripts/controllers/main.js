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
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    $scope.progress = function(data) {
        $scope.imageData = data;
        drawSocket.emit('image', {imageData: data} );
    };
    $scope.submit = function(data) {
        $scope.imageData = data;
        drawSocket.emit('image', {imageData: data} );
    };
  });
