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
    'ngTouch',
    'btford.socket-io',
    'colorpicker.module'
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
