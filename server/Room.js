var questions = [
  "What do you think?",
  "Where do you want to be?",
  "Nice dog"
];
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
  this.bets = [];
  this.winningUser = null;
  this.question = null;
  this.users = [];
}
var rooms = {};
Room.getRooms = function() {
  return rooms;
}
Room.prototype.broadcast = function(event, data) {
  for(var i = 0; i < this.users.length; i++) {
    if (this.users[i].socket) {
      this.users[i].socket.emit(event, data);
    }
  }
}
Room.prototype.resetBets = function() {
  for(var i = 0; i < this.users.length; i++) {
    this.users[i].bets = false;
  }
}
Room.prototype.selectNewCaller = function() {
  this.resetBets();
  if (this.users.length < 1) {
    this.caller = null;
    return;
  }
  if (this.users.length == 1) {
    this.caller = this.users[0];
    return;
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
  this.question = this.question[Math.floor(Math.random() * this.question.length)];
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
    selectedIndex = Math.random()*(this.users.length-1);
    if (this.caller != this.users[selectedIndex])
      break;
  }
  this.selectAnswer(selectedIndex);
}
Room.prototype.selectAnswer = function(index) {
  if (this.caller == this.users[index])
    return false;
  if (this.state !== 'callerSelectAnswer')
    return false;
  this.winningUser = this.users[index];
  this.setState('playersBet');
  return true;
}
Room.prototype.betOnUser = function(bettor, target) {
  if (this.state !== 'playersBet')
    return false;
  if (this.users.indexOf(bettor) < 0 || bettor == this.caller)
    return false;
  if (this.users.indexOf(target) < 0 || target == this.caller)
    return false;
  if (bettor.bets === false || typeof bettor.bets === "undefined") {
    bettor.bets = [];
  }
  if (bettor.bets.length >= this.coinMax)
    return false;
  bettor.bets.push(target.username);
  // check if all bets are submitted
  if (this.areAllBetsSubmitted()) {
    this.submitAllBets();
  }
  return true;
}
Room.prototype.areAllAnswersSubmitted = function() {
  if (this.state !== 'playersAnswerQuestion') {
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
  if (this.state !== 'playersBet') {
    return false;
  }
  for(var i =0; i < this.users.length; i++) {
    if (this.users[i] == this.caller)
      continue;
    var user = this.users[i];
    if (user.bets.length < this.coinMax)
      return false;
  }
  return true;
}
Room.prototype.submitAllBets = function() {
  // TODO calculate results
  this.setState('results');
}
Room.prototype.setState = function(state) {
  this.state.status = state;
  if (this.state.timerHandle) {
    clearTimeout(this.state.timerHandle);
  }
  if (state == 'waiting') {
    this.state.timerHandle = null;
    this.state.timerEnd = null;
  }
  else if (state == 'callerSelectQuestion') {
    this.state.timerHandle = setTimeout(this.selectRandomQuestion, 30 * 1000);
    this.state.timerEnd = Date.now() + 30 * 1000;
  }
  else if (state == 'playersAnswerQuestion') {
    // reset user answer state
    for(var i = 0; i < this.users.length; i++) {
      this.users[i].answerSubmitted = false;
    }
    this.state.timerHandle = setTimeout(this.submitAllAnswers, 120 * 1000);
    this.state.timerEnd = Date.now() + 120 * 1000;
  }
  else if (state == 'callerSelectAnswer') {
    this.state.timerHandle = setTimeout(this.selectRandomAnswer, 60 * 1000);
    this.state.timerEnd = Date.now() + 60 * 1000;
  }
  else if (state == 'playersBet') {
    this.state.timerHandle = setTimeout(this.submitAllBets, 60 * 1000);
    this.state.timerEnd = Date.now() + 60 * 1000;
  }
  else if (state == 'results') {
    this.state.timerHandle = setTimeout(this.selectNewCaller, 30 * 1000);
    this.state.timerEnd = Date.now() + 30 * 1000;
  }
  this.broadcast('room', this.serialize());
}
Room.prototype.setCaller = function(user) {
  for(var i = 0; i < this.users.length; i++) {
    if (user.username == this.users[i].username) {
      this.caller = this.users[i];
      return;
    }
  }
}
Room.prototype.isCaller = function(user) {
  return (this.caller.username == user.username)
}
Room.prototype.serialize = function(notRecursive) {
  var ret = {};
  var keys = Object.keys(this);
  for(var i in keys) {
    var key = keys[i];
    if (key != 'users' && key != 'password' && key != 'caller' && key != 'winningUser')
      ret[key] = this[key];
    if (key == 'caller')
      ret[key] = this.caller.username;
    if (key == "users") {
      ret[key] = this.users.map(function(currentValue, index, users) {
        if (notRecursive) {
          return currentValue.username;
        }
        else {
          return currentValue.serialize(true);
        }
      });
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
  if (this.users.indexOf(user) > -1)
    return true;
  this.users.splice(this.users.indexOf(user), 1);
  return true;
}

module.exports = Room;