var md5 = require('MD5');
var questions = require('../questions.json');
function Room(name) {
  this.name = name;
  this.password = false;
  this.callerText = "";
  this.caller = null;
  this.state = {
    status: 'waiting',
    timerHandle: null,
    timerEnd: null
  };
  this.coinMax = 2;
  this.winningUser = null;
  this.question = null;
  this.users = [];
}
var rooms = {};
Room.getRooms = function() {
  return rooms;
}
Room.prototype.broadcast = function(eventType, data) {
  for(var i = 0; i < this.users.length; i++) {
    if (this.users[i].socket) {
      this.users[i].socket.emit(eventType, data);
    }
  }
}
Room.prototype.resetBets = function() {
  for(var i = 0; i < this.users.length; i++) {
    this.users[i].bets = false;
  }
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
  for(var i = 0; i < this.users.length; i++) {
    if (this.users[i] == this.caller)
      continue;
    this.users[i].answerSubmitted = true;
  }
  this.setState('callerSelectAnswer');
}
Room.prototype.selectRandomAnswer = function() {
  var selectedIndex = 0;
  for(var n = 0; n < 100; n++) {
    selectedIndex = Math.floor(Math.random()*(this.users.length-1));
    if (this.caller != this.users[selectedIndex])
      break;
  }
  this.selectAnswer(this.users[selectedIndex].username);
}
Room.prototype.selectAnswer = function(username) {
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
    if (this.users[i].username == username) {
      return true;
    }
  }
  return false;
}
Room.prototype.isUserCaller = function(username) {
  return this.caller.username == username;
}
Room.prototype.betOnUser = function(bettor, targetUsername) {
  if (this.state.status !== 'playersBet')
    return false;
  if (this.users.indexOf(bettor) < 0 || bettor == this.caller)
    return false;
  if (!this.isUserInRoom(targetUsername) || this.isUserCaller(targetUsername))
    return false;
  if (bettor.bets === false || typeof bettor.bets === "undefined") {
    bettor.bets = [];
  }
  if (bettor.bets.length >= this.coinMax)
    return false;
  bettor.bets.push(targetUsername);
  // check if all bets are submitted
  if (this.areAllBetsSubmitted()) {
    this.submitAllBets();
  }
  else {
    this.broadcast('room', this.serialize(true));
  }
  return true;
}
Room.prototype.areAllAnswersSubmitted = function() {
  if (this.state.status !== 'playersAnswerQuestion') {
    return false;
  }
  for(var i =0; i < this.users.length; i++) {
    if (this.users[i] == this.caller)
      continue;
    var user = this.users[i];
    if (!user.answerSubmitted)
      return false;
  }
  return true;
}
Room.prototype.areAllBetsSubmitted = function() {
  if (this.state.status !== 'playersBet') {
    return false;
  }
  for(var i =0; i < this.users.length; i++) {
    if (this.users[i] === this.caller)
      continue;
    var user = this.users[i];
    if (!Array.isArray(user.bets)) {
      return false;
    }
    if (user.bets.length < this.coinMax) {
      return false;
    }
  }
  return true;
}
Room.prototype.submitAllBets = function() {
  // TODO calculate results
  this.setState('results');
}
Room.prototype.setState = function(state) {
  var self = this;
  this.state.status = state;
  if (this.state.timerHandle) {
    clearTimeout(this.state.timerHandle);
  }
  if (this.users.length <= 1) {
    state = 'waiting';
    this.state.status = 'waiting';
  }
  if (state == 'waiting') {
    this.state.timerHandle = null;
    this.state.timerEnd = null;
  }
  else if (state == 'callerSelectQuestion') {
    this.state.timerHandle = setTimeout(function() { self.selectRandomQuestion() }, 45 * 1000);
    this.state.timerEnd = Date.now() + 45 * 1000;
  }
  else if (state == 'playersAnswerQuestion') {
    // reset user answer state
    for(var i = 0; i < this.users.length; i++) {
      this.users[i].answerSubmitted = false;
    }
    this.state.timerHandle = setTimeout(function() { self.submitAllAnswers() }, 180 * 1000);
    this.state.timerEnd = Date.now() + 180 * 1000;
  }
  else if (state == 'callerSelectAnswer') {
    this.state.timerHandle = setTimeout(function() { self.selectRandomAnswer() }, 120 * 1000);
    this.state.timerEnd = Date.now() + 120 * 1000;
  }
  else if (state == 'playersBet') {
    this.state.timerHandle = setTimeout(function() { self.submitAllBets() }, 120 * 1000);
    this.state.timerEnd = Date.now() + 120 * 1000;
  }
  else if (state == 'results') {
    this.state.timerHandle = setTimeout(function() { self.selectNewCaller() }, 30 * 1000);
    this.state.timerEnd = Date.now() + 30 * 1000;
  }
  this.broadcast('room', this.serialize(true));
}
Room.prototype.setCaller = function(user) {
  for(var i = 0; i < this.users.length; i++) {
    if (user.username == this.users[i].username) {
      this.caller = this.users[i];
      return true;
    }
  }
  return false;
}
Room.prototype.isCaller = function(user) {
  return (this.caller.username == user.username)
}
Room.prototype.serialize = function(notRecursive) {
  function serializeUsers(self) {
    var ret = [];
    if (typeof self.users !== "undefined" && typeof self.users.length !== "undefined") {
      for(var i = 0; i < self.users.length; i++) {
        ret.push(self.users[i].username);
      }
    }
    return ret;
  }
  var ret = {};
  var keys = Object.keys(this);
  for(var i in keys) {
    var key = keys[i];
    if (key != 'users' && key != 'password' && key != 'caller' && key != 'winningUser' && key != 'state' && key != 'bets')
      ret[key] = this[key];
    if (key == 'caller') {
      if (this.caller)
        ret[key] = this.caller.username;
      else
        ret[key] = null;
    }
    if (key == 'password') {
      if (this.password !== false) {
        ret[key] = true;
      }
      else {
        ret[key] = false;
      }
    }
    if (key == 'winningUser') {
      if (this.winningUser && this.state.status == 'results')
        ret[key] = this.winningUser;
      else
        ret[key] = null;
    }
    if (key == "state" ) {
      ret[key] = { status: this.state.status, timerEnd: this.state.timerEnd };
    }
    if (key == "users") {
      ret[key] = serializeUsers(this);
    }
  }
  ret.bets = {};
  // targets
  for(var i = 0; i < this.users.length; i++) {
    ret.bets[this.users[i].username] = [];
  }
  // bettors
  for(var i = 0; i < this.users.length; i++) {
    if (Array.isArray(this.users[i].bets)) {
      for(var j = 0; j < this.users[i].bets.length; j++) {
        if (this.users[i].bets[j] in ret.bets) {
          ret.bets[this.users[i].bets[j]].push(this.users[i].username);
        }
      }
    }
  }
  return ret;
};
Room.prototype.setPassword = function(password) {
  this.password = md5(password);
}
Room.prototype.verifyPassword = function(passwordTest) {
  if (this.password === false)
    return true;
  return md5(passwordTest) === this.password;
}
Room.prototype.addUser = function(user) {
  if (this.users.indexOf(user) > -1)
    return true;
  this.users.push(user);
  return true;
};
Room.prototype.removeUser = function(user) {
  if (this.users.indexOf(user) == -1)
    return true;
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