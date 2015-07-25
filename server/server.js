var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var md5 = require('MD5');

app.listen(40001);

var questions = [
  "What do you think?",
  "Where do you want to be?",
  "Nice dog"
];

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}
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
  this.winningUserIndex = null;
  this.question = null;
  this.users = [];
}
Room.prototype.broadcast = function(event, data) {
  for(var i = 0; i < this.users.length; i++) {
    if (this.users[i].socket) {
      this.users[i].socket.emit(event, data);
    }
  }
}
Room.prototype.selectNewCaller = function() {
  this.bets = [];
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
  while(this.caller == null) {
    var i = Math.floor(Math.random() * this.users.length);
    if (this.users[i] != oldCaller) {
      this.caller = this.users[i];
      return;
    }
  }
  // give questions 
  this.question = [];
  var usedIndices = [];
  for(var n = 0; n < 4; n++) {
    if (usedIndices.length >= questions.length)
      break;
    var index;
    while(true) {
      index = Math.floor(Math.random() * questions.length);
      if (usedIndices.indexOf(index) == -1) {
        break; // found an index not being used
      }
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
  this.setState('callerSelectAnswer');
}
Room.prototype.selectRandomAnswer = function() {
  var selectedIndex = 0;
  for(var n = 0; n < 100; n+++) {
    selectedIndex = Math.random()*(this.users.length-1);
    if (this.caller != this.users[selectedIndex])
      break;
  }
  this.selectAnswer(selectedIndex);
}
Room.prototype.selectAnswer = function(index) {
  this.winningUserIndex = index;
  this.setState('playersBet');
}
Room.prototype.betOnUser = function(bettor, target) {
  if (this.users.indexOf(bettor) < 0 || bettor == this.caller)
    return false;
  if (this.users.indexOf(target) < 0 || target == this.caller)
    return false;
  if (typeof this.bets[bettor.username] === "undefined") {
    this.bets[bettor.username] = [];
  }
  if (this.bets[bettor.username].length >= this.coinMax)
    return false;
  this.bets[bettor.username].push(target.username);
}
Room.prototype.submitAllBets = function(index) {
  // calculate results
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
Room.prototype.serialize = function() {
  var ret = {};
  var keys = Object.keys(this);
  for(var i in keys) {
    var key = keys[i];
    if (key != 'users' && key != 'password' && key != 'caller' && key != 'winningUserIndex')
      ret[key] = this[key];
    if (key == 'caller')
      ret[key] = this.caller.username;
    if (key == "users") {
      ret[key] = this.users.map(function(currentValue, index, users) {
        return currentValue.username;
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
function User(socket) {
  this.socket = socket;
  this.username = "";
  this.accessToken = "";
  this.drawboard = {};
  this.room = false;
}
User.prototype.serialize = function() {
  var ret = {};
  var keys = Object.keys(this);
  for(var i in keys) {
    var key = keys[i];
    if (key != 'socket' && key != 'accessToken' && key != 'room')
      ret[key] = this[key];
    if (key === 'room') {
      if (this[key]) {
        ret[key] = this[key].serialize();
      }
      else {
        ret[key] = this[key];
      }
    }
  }
  return ret;
};
User.prototype.createRoom = function(roomName) {
  if (typeof rooms[roomName] !== "undefined") {
    return "A room with this name already exists.";
  }
  if (this.room !== false)
    return "You must leave your current room.";
  rooms[roomName] = new Room(roomName);
  rooms[roomName].addUser(this);
  this.room = rooms[roomName];
  return true;
};
User.prototype.joinRoom = function(roomName) {
  if (typeof rooms[roomName] === "undefined") {
    return "This room does not exist.";
  }
  if (this.room !== false)
    return "You must leave your current room.";
  rooms[roomName].addUser(this);
  this.room = rooms[roomName];
  return true;
};
User.prototype.leaveRoom = function() {
  if (this.room === false)
    return "You are not in a room";
  if (this.room) {
    this.room.removeUser(this);
  }
  this.room = false;
  return true;
};
User.prototype.isInRoom = function() {
  return (this.room !== false);
}
User.prototype.isCaller = function() {
  return this.isInRoom() && (this.room.caller === this);
}

var users = [];
var rooms = {};


function allUsers() {
  return users.map(function(val) {
    return { username: val.username, drawboard: val.drawboard };
  });
}

function allRooms() {
  var ret = [];
  var keys = Object.keys(rooms);
  for(var i in keys) {
    var key = keys[i];
    ret.push(rooms[key].serialize());
  }
  return ret;
}

function broadcast() {
  for(var i in users) {
    if (users[i].socket) {
      users[i].socket.emit('users', allUsers());
    }
  }
}

function sendRooms(user) {
  user.socket.emit('rooms', allRooms());
}

io.on('connection', function(socket){
  socket.on('error', function (err) {
    console.log(err);
  });
  console.log('a user connected');
  var user;

  function onLogin() {
    socket.emit('users', allUsers());
    socket.emit('user', user.serialize() );
    sendRooms(user);
  }
  socket.on('createRoom', function(data) {
    var result;
    if ( (result = user.createRoom(data.name)) !== true ) {
      socket.emit('errorMessage', { user: user.serialize(), error: result } );
    }
    else {
      socket.emit('user', user.serialize() );
    }
  });
  socket.on('joinRoom', function(data) {
    var result;
    if ( (result = user.joinRoom(data.name)) !== true ) {
      socket.emit('errorMessage', { user: user.serialize(), error: result } );
    }
    else {
      socket.emit('user', user.serialize() );
    }
  });
  socket.on('leaveRoom', function(data) {
    var result;
    if ( (result = user.leaveRoom()) !== true ) {
      socket.emit('errorMessage', { user: user.serialize(), error: result } );
    }
    else {
      socket.emit('user', user.serialize() );
    }
  });
  socket.on('login', function(data) {
    for (var key = 0; key < users.length; key++) {
      if (users[key].username === data.username) {
        if (users[key].accessToken !== data.accessToken) {
          return socket.emit('logout', { error: "This user already exists." });
        }
        console.log('existing user');
        // log out the user that's logged in
        if (users[key].socket) {
          users[key].socket.emit('logout', { message: "You've been logged out from another device." });
        }
        users[key].socket = socket;
        user = users[key];
        return onLogin();
      }
    }
    console.log('new user');
    user = new User(socket);
    user.username = data.username;
    user.accessToken = data.accessToken;
    users.push(user);
    return onLogin();
  });

  // room functions

  socket.on('room.selectQuestion', function(data) {
    if (!user) {
      return socket.emit('logout', { error: "You are not logged in." });
    }
    if (!user.isInRoom() || !user.isCaller()) { 
      return socket.emit('error', { error: "Your cannot select a question." });
    }
    user.room.selectQuestion(data.questionIndex);
  });

  socket.on('drawboard', function(data) {
    if (!user) {
      return socket.emit('logout', { error: "You are not logged in." });
    }
    console.log(user.username + ' sent an image');
    user.drawboard = data.drawboard;
    broadcast();
  });

  socket.on('disconnect', function () {
    if (user) {
      users[users.indexOf(user)].socket = false;
    }
    broadcast();
  });
});