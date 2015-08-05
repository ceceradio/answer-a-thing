var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var md5 = require('MD5');
var User = require('User.js');
var Room = require('Room.js');

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

  socket.on('room.betOnUser', function(data) {
    if (!user) {
      return socket.emit('logout', { error: "You are not logged in." });
    }
    if (!user.isInRoom() || user.isCaller()) { 
      return socket.emit('error', { error: "Your cannot bet." });
    }
    if (!user.room.betOnUser(user, user.room.users[data.userIndex])) {
      return socket.emit('error', { error: "Your cannot bet on this user." });
    }
  });
  socket.on('room.submitAnswer', function(data) {
    if (!user) {
      return socket.emit('logout', { error: "You are not logged in." });
    }
    if (!user.isInRoom() || user.isCaller()) { 
      return socket.emit('error', { error: "Your cannot submit an answer." });
    }
    user.answerSubmitted = true;
    if (user.room.areAllAnswersSubmitted()) {
      user.room.submitAllAnswers();
    }
    else {
      user.room.broadcast('room', user.room.serialize());
    }
  });
  socket.on('room.selectAnswer', function(data) {
    if (!user) {
      return socket.emit('logout', { error: "You are not logged in." });
    }
    if (!user.isInRoom() || !user.isCaller()) { 
      return socket.emit('error', { error: "Your cannot select a question." });
    }
    user.room.selectAnswer(data.userIndex);
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