'use strict';

angular.module('answerAThingApp').
  factory('drawSocket', function (socketFactory) {
    return socketFactory({ ioSocket: io('http://devfluid.com:40001') });
  })
  .factory('gameState', function(drawSocket) {
    var gameState = {
      room: { name: "", password: "" },
      user: { name: "", accessToken: "" },
      state: 'loggedout'
    }
    drawSocket.on('user', function(user) {
      if (user.room !== false) {
        gameState.state = 'inroom';
      }
      else {
        gameState.state = 'inlobby';
      }
    });
    drawSocket.on('logout', function(error) {
      console.log(error);
      gameState.state = 'loggedout';
    });
    return gameState;
  });