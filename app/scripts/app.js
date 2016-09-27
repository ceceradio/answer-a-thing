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
    'ui.bootstrap',
    'ngRoute',
    'ngTouch',
    'btford.socket-io'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/login', {
        templateUrl: 'components/login/login.html?'+Date.now(),
        controller: 'LoginController'
      })
      .when('/lobby', {
        templateUrl: 'components/lobby/lobby.html?'+Date.now(),
        controller: 'LobbyController'
      })
      .when('/createroom', {
        templateUrl: 'components/createroom//createroom.html?'+Date.now(),
        controller: 'CreateRoomController'
      })
      .when('/how-to-play', {
        templateUrl: 'views/howtoplay.html?'+Date.now()
      })
      .when('/room/:room_id', {
        templateUrl: 'components/room/room.html?'+Date.now(),
        controller: 'RoomController'
      })
      .otherwise({
        redirectTo: '/login'
      });
  });
