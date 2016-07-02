"use strict";
const EventEmitter = require('events');
var admins = require('../admins.json');
class User extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
    this.username = "";
    this.accessToken = "";
    this.bets = false;
    this.drawboard = {};
    this.room = false;
    this.answerSubmitted = false;
  }
  canHaveName(username, accessToken) {
    if (!(username in admins)) {
      return true;
    }
    if (admins[username].accessToken === accessToken) {
      return true;
    }
    return false;
  }
  isAdmin() {
    if (this.username in admins && admins[this.username].accessToken == this.accessToken) {
      return true;
    }
    return false;
  }
  serialize() {
    function replacer(key, value) {
      if (key === 'socket' || key === 'accessToken' || key.charAt(0) === '_') return undefined;
      if (key === 'room' && value) return value.name;
      return value;
    }
    return JSON.parse(JSON.stringify(this, replacer));
  }
  resetBet() {
    this.bets = false;
    this.reverseBets = false;
  }
  submitAnswer() {
    this.answerSubmitted = true;
  }
  isInRoom() {
    return (this.room !== false);
  }
  isCaller() {
    return this.isInRoom() && (this.room.caller === this);
  }
  betOnUser(targetUser) {
    if (!this.isInRoom()) return false;
    if (this.isCaller()) return false;
    if (!this.room.canPlayersBet()) return false;
    if (!this.room.isUserInRoom(this.username)) return false;
    if (!this.room.isUserInRoom(targetUser.username)) return false;
    if (this.room.isUserCaller(targetUser.username)) return false;
    if (!this.hasOwnProperty('bets') || !this.bets) this.bets = [];
    if (!targetUser.hasOwnProperty('reverseBets') || !targetUser.reverseBets) targetUser.reverseBets = [];
    if (this.bets.length >= this.room.betMax)
      return false;
    this.bets.push(targetUser.username);
    targetUser.reverseBets.push(this.username);
    // inform the room that we have bet
    this.emit('bet');
    return true;
  }
}
module.exports = User;