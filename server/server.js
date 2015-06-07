var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(40001);

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
  this.users = [];
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
  for(var key in Object.keys(this)) {
    if (key != 'socket' && key != 'accessToken')
      ret[key] = this[key];
  }
  return ret;
};
User.prototype.joinRoom = function(roomName) {
  if (typeof rooms[roomName] === "undefined") {
    return "This room does not exist.";
  }
  if (this.room !== false)
    return "You must leave your current room.";
  this.room = roomName;
  if (rooms[roomName].users.indexOf(this) === -1)
    rooms[roomName].users.push(this);
  return true;
};
User.prototype.leaveRoom = function() {
  if (this.room === false)
    return "You are not in a room";
  if (rooms[roomName]) {
    rooms[roomName].users.splice(rooms[roomName].users.indexOf(this), 1);
  }
  this.room = false;
  return true;
};

var users = [];
var rooms = {};


function allUsers() {
  return users.map(function(val) {
    return { username: val.username, drawboard: val.drawboard };
  });
}

function broadcast() {
  for(var i in users) {
    users[i].socket.emit('users', allUsers());
  }
}

io.on('connection', function(socket){
  socket.on('error', function (err) {
    console.log(err);
  });
  console.log('a user connected');
  var user;

  function onLogin() {
    socket.emit('users', allUsers());
    socket.emit('user', { user: this.serialize() });
  }
  socket.on('joinRoom', function(data) {
    if ( (var result = this.joinRoom(data.name) !== true ) {
      socket.emit('error', { user: this, error: result } );
    }
    else {
      socket.emit('user', { user: this.serialize() });
    }
  });
  socket.on('leaveRoom', function(data) {
    if ( (var result = this.leaveRoom() !== true ) {
      socket.emit('error', { user: this, error: result } );
    }
    else {
      socket.emit('user', { user: this.serialize() });
    }
  });
  socket.on('login', function(data) {
    console.log(data);
    for(var key in users) {
      if (users[key].username === data.username) {
        if (users[key].accessToken === data.accessToken) {
          console.log('existing user');
          // log out the user that's logged in
          users[key].socket.emit('logout', { message: "You've been logged out from another device." });
          users[key].socket = socket;
          user = users[key];
          return onLogin();
        }
        else {
          return socket.emit('logout', { error: "This user already exists." });
        }
      }
    }
    console.log('new user');
    user = new User(socket);
    user.username = data.username;
    user.accessToken = data.accessToken;
    users.push(user);
    return onLogin();
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
    if (user)
      users.splice(users.indexOf(user),1);
    broadcast();
  });
});