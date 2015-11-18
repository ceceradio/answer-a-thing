'use strict';

angular.module('answerAThingApp').
  factory('drawSocket', function (socketFactory) {
    return socketFactory({ ioSocket: io(window.location.protocol+'//'+window.location.hostname+':40001') });
  })
  .factory('drawboardService', function(drawSocket) {
    var service = {
      listeners: [],
      addListener: function(callback) {
        this.listeners.push(callback);
      },
      removeListener: function(callback) {
        if (this.listeners.indexOf(callback) > -1) {
          this.listeners.splice(this.listeners.indexOf(callback), 1);
        }
      }
    }
    drawSocket.on('drawboard', function(data) {
      for(var i = 0; i < service.listeners.length; i++) {
        service.listeners[i](data);
      }
    });
    return service;
  })
  .factory('gameState', function(drawSocket, $location, $window) {
    var gameState = {
      rooms: [],
      user: { username: '', accessToken: '' },
      state: 'loggedout',
      errorMessage: '',
      alerts: []
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
    drawSocket.on('room', function(room) {
      gameState.user.room = room;
    });
    drawSocket.on('errorMessage', function(data) {
      gameState.alerts.push(data);
    });
    drawSocket.on('user', function(user) {
      angular.extend(gameState.user, user);
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
      gameState.user.username = '';
      $window.localStorage.setItem('username', '');
      gameState.errorMessage = error.message;
      gameState.state = 'loggedout';
      $location.url('/login');
    });
    drawSocket.emit('user.login', gameState.user);
    return gameState;
  });