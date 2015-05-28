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

function User(socket) {
  this.socket = socket;
  this.username = "";
  this.accessToken = "";
  this.drawboard = {};
}

var users = [];

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
    socket.emit('user', { user: { username: user.username } });
  }
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