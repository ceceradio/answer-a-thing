"use strict";
var md5 = require('MD5');
const User = require('./User.js');
var questions = require('../questions.json');
function Room(name) {
  this.name = name;
  this.password = false;
  this.callerText = "";
  this.caller = null;
  this.state = {
    status: 'waiting',
    _timerHandle: null,
    timerEnd: null
  };
  this.betMax = 2;
  this.winningUser = null;
  this.question = null;
  this.users = [];
}
var rooms = {};
Room.getRooms = function() {
  return rooms;
}
Room.create = function(user, roomName) {
  if (rooms.hasOwnProperty(roomName)) throw new Error("A room with this name already exists.");
  if (user.room) throw new Error("You must leave your current room.");
  rooms[roomName] = new Room(roomName);
  rooms[roomName].addUser(user);
  user.answerSubmitted = false;
  return rooms[roomName];
}
Room.prototype.onUserBet = function() {
  if (this.areAllBetsSubmitted()) {
    this.calculateResults();
  }
}
Room.prototype.broadcast = function(eventType, data) {
  for(var i = 0; i < this.users.length; i++) {
    if (this.users[i].socket) {
      this.users[i].socket.emit(eventType, data);
    }
  }
}
Room.prototype.join = function(user, roomPassword) {
  if (user.room !== false) throw new Error("You must leave your current room.");
  if (this.password && !this.verifyPassword(roomPassword)) throw new Error("Password is incorrect!");
  this.addUser(user);
  user.answerSubmitted = false;
  return this;
};
Room.prototype.leave = function(user) {
  if (user.room !== this) throw new Error("You are not in this room");
  this.removeUser(user);
  user.answerSubmitted = false;
  return this;
};
Room.prototype.resetBets = function() {
  this.users.forEach(function(user) {
    user.resetBet();
  });
}
Room.prototype.resetCaller = function() {
  if (this.users.length < 1) {
    this.caller = null;
    return false;
  }
  // we can't start a game with just 1 player
  if (this.users.length == 1) {
    this.caller = this.users[0];
    return false;
  }
  var oldCaller = this.caller;
  this.caller = null;

  var i = (this.users.indexOf(oldCaller) + 1) % this.users.length;
  if (this.users[i] != oldCaller) {
    this.caller = this.users[i];
  }
  else {
    // somehow we ended up at the same caller?
    this.caller = this.users[i];
  }
  return true;
}
Room.prototype.selectNewCaller = function() {
  this.resetBets();
  this.resetCaller();

  // give questions 
  this.question = [];
  var usedIndices = [];
  for(var n = 0; n < 4; n++) {
    if (usedIndices.length >= questions.length)
      break;
    var index;
    var tries = 0;
    while(tries < 10) {
      index = Math.floor(Math.random() * questions.length);
      if (usedIndices.indexOf(index) == -1) {
        usedIndices.push(index);
        break; // found an index not being used
      }
      tries++;
    }
    this.question.push(questions[index]);
  }
  this.setState('callerSelectQuestion');
}
Room.prototype.selectRandomQuestion = function() {
  this.selectQuestion(Math.floor(Math.random() * this.question.length));
}
Room.prototype.selectQuestion = function(index) {
  if (this.state.status !== "callerSelectQuestion")
    return false;
  if (index < 0 || index >= this.question.length)
    return false;
  this.question = this.question[index];
  this.setState('playersAnswerQuestion');
  return true;
}
Room.prototype.submitAllAnswers = function() {
  this.users.forEach(function(user) {
    if (user === this.caller)
      return;
    user.submitAnswer();
  })
  this.setState('callerSelectAnswer');
}
Room.prototype.selectRandomAnswer = function() {
  var selectedIndex = 0;
  for(var n = 0; n < 100; n++) {
    selectedIndex = Math.floor(Math.random()*(this.users.length-1));
    if (this.caller !== this.users[selectedIndex])
      break;
  }
  this.selectAnswer(this.users[selectedIndex].username);
}
Room.prototype.selectWinner = function(username) {
  if (!this.isUserInRoom(username))
    return false;
  if (this.isUserCaller(username))
    return false;
  if (this.state.status !== 'callerSelectAnswer')
    return false;
  this.winningUser = username;
  this.setState('playersBet');
  return true;
}
Room.prototype.isUserInRoom = function(username) {
  for (var i = 0; i < this.users.length; i++) {
    if (this.users[i].username === username) {
      return true;
    }
  }
  return false;
}
Room.prototype.isUserCaller = function(username) {
  if (!this.caller) return false;
  return this.caller.username === username;
}
Room.prototype.canPlayersBet = function() {
  return this.state.status === 'playersBet';
}
Room.prototype.areAllAnswersSubmitted = function() {
  if (this.state.status !== 'playersAnswerQuestion') {
    return false;
  }
  for(var i =0; i < this.users.length; i++) {
    if (this.users[i].isCaller()) continue;
    if (!this.users[i].answerSubmitted) return false;
  }
  return true;
}
Room.prototype.areAllBetsSubmitted = function() {
  if (this.state.status !== 'playersBet') {
    return false;
  }
  for(var i =0; i < this.users.length; i++) {
    if (this.users[i].isCaller()) continue;
    var user = this.users[i];
    if (!Array.isArray(user.bets)) return false;
    if (user.bets.length < this.betMax) return false;
  }
  return true;
}
Room.prototype.calculateResults = function() {
  // TODO calculate results
  this.setState('results');
}
Room.stateTransitions = {
  waiting: {
  },
  callerSelectQuestion: {
    timeLimitFunction: Room.prototype.selectRandomQuestion,
    timeLimit: 45 * 1000
  },
  playersAnswerQuestion: {
    on: function() {
      for(var i = 0; i < this.users.length; i++) {
        this.users[i].answerSubmitted = false;
      }
    },
    timeLimitFunction: Room.prototype.submitAllAnswers,
    timeLimit: 180 * 1000
  },
  callerSelectAnswer: {
    timeLimitFunction: Room.prototype.selectRandomAnswer,
    timeLimit: 120 * 1000,
  },
  playersBet: {
    timeLimitFunction: Room.prototype.calculateResults,
    timeLimit: 120 * 1000,
  },
  results: {
    timeLimitFunction: Room.prototype.selectNewCaller,
    timeLimit: 30 * 1000,
  },
  
}
Room.prototype.setState = function(state) {
  this.state.status = state;
  if (this.state._timerHandle) {
    clearTimeout(this.state._timerHandle);
  }
  if (this.users.length <= 1) {
    state = 'waiting';
    this.state.status = 'waiting';
  }
  if (!Room.stateTransitions.hasOwnProperty(state)) {
    console.log('State '+state+' does not exist!');
    throw new Error('State '+state+' does not exist!');
  }
  var stateTransition = Room.stateTransitions[state];
  if (stateTransition.hasOwnProperty('on')) stateTransition.on();
  if (stateTransition.hasOwnProperty('timeLimit')) {
    var timeLimitFunction = stateTransition.timeLimitFunction.bind(this);
    function timeout() {
      timeLimitFunction();
      this.broadcast('room', this.serialize());
    }
    this.state._timerHandle = setTimeout(timeout.bind(this), stateTransition.timeLimit);
    this.state.timerEnd = Date.now() + stateTransition.timeLimit;
  }
}
Room.prototype.setCaller = function(user) {
  for(var i = 0; i < this.users.length; i++) {
    if (user.username === this.users[i].username) {
      this.caller = this.users[i];
      return true;
    }
  }
  return false;
}
Room.prototype.isCaller = function(user) {
  return this.isUserCaller(user.username);
}
Room.prototype.serialize = function() {
  function replacer(key, value) {
    if (key === 'password' || key.charAt(0) === '_') return undefined;
    if (key === 'caller') {
      if (value) return value.username;
      return null;
    }
    if (key === 'winningUser') {
      if (this.state.status === 'results') {
        return this.winningUser;
      }
      else {
        return undefined;
      }
    }
    if (value instanceof User) return value.serialize();
    return value;
  }
  return JSON.parse(JSON.stringify(this, replacer));
};
Room.prototype.setPassword = function(password) {
  this.password = md5(password);
}
Room.prototype.verifyPassword = function(passwordTest) {
  if (this.password === false) return true;
  return md5(passwordTest) === this.password;
}
Room.prototype.addUser = function(user) {
  user.room = this;
  user.on('bet', this.onUserBet.bind(this));
  if (this.users.indexOf(user) > -1) return true;
  this.users.push(user);
  return true;
};
Room.prototype.removeUser = function(user) {
  user.room = false;
  user.removeAllListeners('bet');
  if (this.users.indexOf(user) === -1) return true;
  this.users.splice(this.users.indexOf(user), 1);
  if (this.caller && user.username === this.caller.username) {
    if (this.resetCaller() === false) {
      this.setState('waiting');
      return true;
    }
  }
  if (this.users.length <= 1) {
    this.setState('waiting');
  }
  return true;
}

module.exports = Room;