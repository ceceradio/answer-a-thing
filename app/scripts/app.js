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
      .when('/login', {
        templateUrl: 'views/login.html?'+Date.now(),
        controller: 'LoginController'
      })
      .when('/lobby', {
        templateUrl: 'views/lobby.html?'+Date.now(),
        controller: 'LobbyController'
      })
      .when('/createroom', {
        templateUrl: 'views/createroom.html?'+Date.now(),
        controller: 'CreateRoomController'
      })
      .when('/how-to-play', {
        templateUrl: 'views/howtoplay.html?'+Date.now()
      })
      .when('/room/:room_id', {
        templateUrl: 'views/room.html?'+Date.now(),
        controller: 'RoomController'
      })
      .otherwise({
        redirectTo: '/login'
      });
  });
