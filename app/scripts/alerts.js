'use strict';

angular.module('answerAThingApp')
  .directive('alerts', function (drawSocket, gameState) {
    return {
      restrict: 'E',
      templateUrl: '/views/alerts.html?'+Date.now(),
      controller: function($scope) {
        $scope.data = {alerts: gameState.alerts};
        $scope.dismissAlert = function(index) {
          $scope.data.alerts.splice(index,1);
        };
      }
    };
  });