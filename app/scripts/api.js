'use strict';

angular.module('answerAThingApp').
  factory('drawSocket', function (socketFactory) {
    return socketFactory({ ioSocket: io('http://devfluid.com:40001') });
  })
  .factory('gameState', function(drawSocket, $location) {
    var gameState = {
      room: { name: "", password: "" },
      user: { name: "", accessToken: "" },
      state: 'loggedout'
    }
    drawSocket.on('user', function(user) {
      if (user.room !== false) {
        gameState.state = 'inroom';
        $location.url = "room/"+room.name;
      }
      else {
        gameState.state = 'inlobby';
        $location.url = "lobby";
      }
    });
    drawSocket.on('logout', function(error) {
      gameState.state = 'loggedout';
      $location.url = "login";
    });
    return gameState;
  });