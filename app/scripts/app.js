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
        templateUrl: 'views/login.html',
        controller: 'LoginController'
      })
      .when('/lobby', {
        templateUrl: 'views/lobby.html',
        controller: 'LobbyController'
      })
      .when('/createroom', {
        templateUrl: 'views/createroom.html',
        controller: 'CreateRoomController'
      })
      .when('/room/:room_id', {
        templateUrl: 'views/room.html',
        controller: 'RoomController'
      })
      .otherwise({
        redirectTo: '/login'
      });
  });
