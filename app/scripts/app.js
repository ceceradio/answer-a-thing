'use strict';

/**
 * @ngdoc overview
 * @name answerAThingApp
 * @description
 * # answerAThingApp
 *
 * Main module of the application.
 */
angular
  .module('answerAThingApp', [
    'ngRoute',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
