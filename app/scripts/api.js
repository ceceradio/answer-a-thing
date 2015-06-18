'use strict';

angular.module('answerAThingApp').
  factory('drawSocket', function (socketFactory) {
    return socketFactory({ ioSocket: io('http://devfluid.com:40001') });
  })
  .factory('gameState', function(drawSocket, $location, $window) {
    var gameState = {
      room: { name: "", password: "" },
      user: { username: "", accessToken: "" },
      state: 'loggedout'
    }
    gameState.user.username = $window.localStorage.getItem('username');
    gameState.user.accessToken = $window.localStorage.getItem('accessToken');
    if (!gameState.user.accessToken) {
      gameState.user.accessToken = CryptoJS.SHA3(CryptoJS.lib.WordArray.random(1024)).toString(CryptoJS.enc.Base64);
      $window.localStorage.setItem('accessToken', gameState.user.accessToken);
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