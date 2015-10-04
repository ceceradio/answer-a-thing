'use strict';

angular.module('answerAThingApp').
  factory('drawSocket', function (socketFactory) {
    return socketFactory({ ioSocket: io('http://localhost:40001') });
  })
  .factory('gameState', function(drawSocket, $location, $window) {
    var gameState = {
      rooms: [],
      user: { username: '', accessToken: '' },
      state: 'loggedout',
      errorMessage: ''
    };
    gameState.user.username = $window.localStorage.getItem('username');
    gameState.user.accessToken = $window.localStorage.getItem('accessToken');
    if (!gameState.user.accessToken) {
      gameState.user.accessToken = CryptoJS.SHA3(CryptoJS.lib.WordArray.random(1024)).toString(CryptoJS.enc.Base64);
      $window.localStorage.setItem('accessToken', gameState.user.accessToken);
    }
    drawSocket.on('rooms', function(rooms) {
      gameState.rooms = rooms;
    });
    drawSocket.on('errorMessage', function(data) {
      console.log(data);
    });
    drawSocket.on('user', function(user) {
      gameState.user = user;
      if (user.room !== false) {
        gameState.state = 'inroom';
        $location.url('/room/'+user.room.name);
      }
      else {
        gameState.state = 'inlobby';
        $location.url('/lobby');
      }
    });
    drawSocket.on('logout', function(error) {
      gameState.errorMessage = error.message;
      gameState.state = 'loggedout';
      $location.url ('/login');
    });
    drawSocket.emit('user.login', gameState.user);
    return gameState;
  });