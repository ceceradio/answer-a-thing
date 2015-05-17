var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(3000);

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
  this.imageData = "";
}

var users = [];

function allImages() {
  return users.map(function(val) {
    return val.imageData;
  });
}

function broadcast() {
  for(var i in users) {
    users[i].socket.emit('users', allImages());
  }
}

io.on('connection', function(socket){
  console.log('a user connected');
  var user = new User(socket);
  users.push(user);

  socket.emit('users', allImages());

  socket.on('image', function(data) {
    console.log('a sent an image');
    user.imageData = data.imageData;
    broadcast();
  })

  socket.on('disconnect', function () {
    users.splice(users.indexOf(user),1);
    broadcast();
  });
});