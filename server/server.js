var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var md5 = require('MD5');

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
  this.password = false;
  this.users = [];
}
Room.prototype.serialize = function() {
  var ret = {};
  var keys = Object.keys(this);
  for(var i in keys) {
    var key = keys[i];
    if (key != 'users' && key != 'password')
      ret[key] = this[key];
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