'use strict';

/**
 * @ngdoc function
 * @name answerAThingApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the answerAThingApp
 */
angular.module('answerAThingApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
