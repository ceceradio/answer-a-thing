var Room = require('Room.js');
module.exports = function User(socket) {
  this.socket = socket;
  this.username = "";
  this.accessToken = "";
  this.bets = false;
  this.drawboard = {};
  this.room = false;
  this.answerSubmitted = false;
}
User.prototype.serialize = function(notRecursive) {
  var ret = {};
  var keys = Object.keys(this);
  for(var i in keys) {
    var key = keys[i];
    if (key != 'socket' && key != 'accessToken' && key != 'room')
      ret[key] = this[key];
    if (key === 'room') {
      if (this[key]) {
        if (notRecursive) {
          ret[key] = this[key].name;
        }
        else {
          ret[key] = this[key].serialize(true);
        }
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
  this.answerSubmitted = false;
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
  this.answerSubmitted = false;
  return true;
};
User.prototype.leaveRoom = function() {
  if (this.room === false)
    return "You are not in a room";
  if (this.room) {
    this.room.removeUser(this);
  }
  this.room = false;
  this.answerSubmitted = false;
  return true;
};
User.prototype.isInRoom = function() {
  return (this.room !== false);
}
User.prototype.isCaller = function() {
  return this.isInRoom() && (this.room.caller === this);
}