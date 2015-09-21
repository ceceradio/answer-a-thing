var User = require('../User.js');
var Room = require('../Room.js');
var rooms;
describe("Room", function() {
  var room;
  beforeEach(function() {
    room = new Room();
    // clear the rooms
    rooms = Room.getRooms();
    for (var member in rooms) delete rooms[member];
  });
  describe('.resetBets()', function() {
    it("should set all user's bets property to false", function() {
      room.users = [{ bets: 1 }, { bets: 2 }];
      room.resetBets();
      for(var i = 0; i < room.users.length; i++) {
        expect(room.users[i].bets).toEqual(false);
      }
    });
  });
  describe('.selectNewCaller()', function() {
    var firstUser;
    beforeEach(function() {
      firstUser = new User();
      firstUser.username = "1";
      room.users.push( firstUser );
      room.users.push( new User() );
    });
    it("should call resetBets()", function() {
      spyOn(room, 'resetBets').and.callThrough();
      room.selectNewCaller();
      expect(room.resetBets).toHaveBeenCalled();
    });
    it("should select a new caller from the users in the room sequentially, starting with user 0", function() {
      room.selectNewCaller();
      expect(room.caller).toEqual(firstUser);
    });
    it("should populate the questions", function() {
      room.selectNewCaller();
      expect(room.question.length).toEqual(4);
    });
    it("should setState('callerSelectQuestion')", function() {
      spyOn(room,'setState');
      room.selectNewCaller();
      expect(room.setState).toHaveBeenCalledWith('callerSelectQuestion');
    });
  });
  describe('.selectQuestion(index)', function() {
    beforeEach(function() {
      spyOn(room,'setState');
      room.question = [ "test" ]; 
      room.state.status = "callerSelectQuestion";
    });
    it('should fail if the status is not callerSelectQuestion', function() {
      room.state.status = "badstate";
      expect(room.selectQuestion(0)).toEqual(false);
    });
    it('should assign to .question the value in question[index]', function() {
      expect(room.selectQuestion(0)).toEqual(true);
      expect(room.question).toEqual('test');
    });
    it('should call setState("playersAnswerQuestion")', function() {
      expect(room.selectQuestion(0)).toEqual(true);
      expect(room.setState).toHaveBeenCalledWith('playersAnswerQuestion');
    });
  });
  describe(".submitAllAnswers()", function() {
    beforeEach(function() {
      spyOn(room,'setState');
      room.caller = { answerSubmitted: false };
      room.users = [ { answerSubmitted: false }, { answerSubmitted: false }, room.caller ];
    });
    it("should set all users' property .answerSubmitted to true except the caller", function() {
      room.submitAllAnswers();
      expect(room.users[0].answerSubmitted).toEqual(true);
      expect(room.users[1].answerSubmitted).toEqual(true);
      expect(room.users[2].answerSubmitted).toEqual(false);
      expect(room.caller.answerSubmitted).toEqual(false);
    });
    it("should setState('callerSelectAnswer')", function() {
      room.submitAllAnswers();
      expect(room.setState).toHaveBeenCalledWith('callerSelectAnswer');
    });
  });
  describe(".selectAnswer(index)", function() {
    beforeEach(function() {
      spyOn(room,'setState');
      room.caller = { answerSubmitted: false };
      room.users = [ { answerSubmitted: false }, { answerSubmitted: false }, room.caller ];
      room.state = 'callerSelectAnswer';
    });
    it("should not let you select the caller for the answer", function() {
      expect(room.selectAnswer(2)).toEqual(false);
    });
    it("should not let you select an answer if the state is not 'callerSelectAnswer'", function() {
      room.state = 'playersBet';
      expect(room.selectAnswer(0)).toEqual(false);
    });
    it("should revert back to 'lobby' if there are no remaining players", function() {
      
    });
    it("should set room.winningUser to the user at the given index", function() {
      room.selectAnswer(0);
      expect(room.users[0]).toEqual(room.winningUser);
      expect(room.winningUser).not.toEqual(null);
    });
    it("should setState('playersBet')", function() {
      room.selectAnswer(0);
      expect(room.setState).toHaveBeenCalledWith('playersBet');
    });
  });
  describe(".betOnUser(bettor, target)", function() {
    var player;
    var caller;
    var bettor;
    beforeEach(function() {
      spyOn(room,'setState');
      room.caller = caller = { username: 'caller' };
      player = { username: 'player' };
      bettor = { username: 'bettor' };
      room.users = [ bettor, player, room.caller ];
      room.state = 'playersBet';
    });
    it('should not allow a user to bet if the room state is not playersBet', function() {
      room.state = 'test';
      expect(room.betOnUser(bettor, player)).toEqual(false);
    });
    it('should not allow a bettor to bet on the caller', function() {
      expect(room.betOnUser(bettor, caller)).toEqual(false);
    });
    it('should not allow a callor to be a bettor', function() {
      expect(room.betOnUser(caller, player)).toEqual(false);
    });
    it('should not allow a user not in the room to bet', function() {
      expect(room.betOnUser({ username: 'who?' }, player)).toEqual(false);
    });
    it('should not allow a user to bet more than the maximum amount', function() {
      bettor.bets = [];
      for(var i=0;i<=room.coinMax;i++) {
        bettor.bets.push("test");
      }
      expect(room.betOnUser(bettor, player)).toEqual(false);
    });
    it('should add the user to the bets', function() {
      expect(room.betOnUser(bettor, player)).toEqual(true);
      expect(bettor.bets.length).toEqual(1);
      expect(bettor.bets[0]).toEqual(player.username);
    });
    it('should execute function to set state to submit all bets if all bets are submitted', function() {
      spyOn(room,'areAllBetsSubmitted').and.returnValue(true);
      spyOn(room, 'submitAllBets');
      expect(room.betOnUser(bettor,player)).toEqual(true);
      expect(room.submitAllBets).toHaveBeenCalled();
    });
  });
  describe(".areAllAnswersSubmitted()", function() {
    var player1, player2, caller;
    beforeEach(function() {
      room.caller = caller = { username: 'caller' };
      player1 = { username: 'player1', answerSubmitted: false };
      player2 = { username: 'player2', answerSubmitted: false };
      room.users = [ player1, player2, room.caller ];
      room.state = 'playersAnswerQuestion';
    });
    it("should return false if not in the correct state", function() {
      room.state = 'playersdoingnothing';
      expect(room.areAllAnswersSubmitted()).toEqual(false);
    });
    it("should return false if any user has not submitted an answer", function() {
      expect(room.areAllAnswersSubmitted()).toEqual(false);
      player1.answerSubmitted = true;
      player2.answerSubmitted = true;
      expect(room.areAllAnswersSubmitted()).toEqual(true);
    });
  });
  describe(".areAllBetsSubmitted()", function() {
    var player1, player2, caller;
    beforeEach(function() {
      room.caller = caller = { username: 'caller' };
      player1 = { username: 'player1', bets: [1] };
      player2 = { username: 'player2', bets: [1,2] };
      room.users = [ player1, player2, room.caller ];
      room.state = 'playersBet';
    });
    it("should return false if not in the correct state", function() {
      room.state = 'playersdoingnothing';
      expect(room.areAllBetsSubmitted()).toEqual(false);
    });
    it("should return false if any user has not submitted an answer", function() {
      expect(room.areAllAnswersSubmitted()).toEqual(false);
      player1.bets.push(2);
      expect(room.areAllBetsSubmitted()).toEqual(true);
    });
  });
  describe('.submitAllBets()', function() {
    it('should calculate the results from bets and assign points', function() {
      // TODO verify results
    });
    it('should set the state to results', function() {
      spyOn(room,'setState');
      room.submitAllBets();
      expect(room.setState).toHaveBeenCalledWith('results');
    });
  });
  describe('.setCaller(user)', function() {
    var player1, player2, caller;
    beforeEach(function() {
      room.caller = caller = { username: 'caller' };
      player1 = { username: 'player1' };
      player2 = { username: 'player2' };
      room.users = [ player1, player2, room.caller ];
      room.state = 'playersBet';
    });
    it('should set room.caller to the user specified if the username in the given user object matches a user in the room', function() {
      expect(room.setCaller({ username: 'player1' })).toEqual(true);
      expect(room.caller).toEqual(player1);
      // should not change the caller
      expect(room.setCaller({ username: 'noone' })).toEqual(false);
      expect(room.caller).toEqual(player1);
    });
  });
  describe('.isCaller(user)', function() {
    var player1, player2, caller;
    beforeEach(function() {
      room.caller = caller = { username: 'caller' };
      player1 = { username: 'player1' };
      player2 = { username: 'player2' };
      room.users = [ player1, player2, room.caller ];
    });
    it('should return if the username of the given user object and the caller are the same', function() {
      expect(room.isCaller(caller)).toEqual(true);
      expect(room.isCaller({ username: 'caller' })).toEqual(true);
      expect(room.isCaller({ username: 'noone' })).toEqual(false);
    });
  });
  describe('.serialize(notRecursive)', function() {
    var user;
    beforeEach(function() {
      user = { serialize: function() { return this; }, username: 'test' };
      room.users = [user];
      room.caller = user;
      room.winningUser = "test";
      room.password = "akakkakak";
      spyOn(user, 'serialize').and.callThrough();
    });
    it('should not call .serialize() on users if notRecursive==true', function() {
      var result = room.serialize(true);
      expect(user.serialize).not.toHaveBeenCalled();
      expect(result.users[0]).toEqual(user.username);
    });
    it('should call .serialize(true) on users if notRecursive is false-y', function() {
      var result = room.serialize();
      expect(user.serialize).toHaveBeenCalledWith(true);
      expect(result.users[0]).toEqual(user);
    });
    it('should serialize the caller as only a username', function() {
      room.caller = { serialize: function() { return this; }, username: 'testerr' };
      spyOn(room.caller, 'serialize').and.callThrough();
      var result = room.serialize();
      expect(room.caller.serialize).not.toHaveBeenCalled();
      expect(result.caller).toEqual(room.caller.username);
    });
    it('should never send the winningUser', function() {
      expect(room.serialize().winningUser).not.toBeDefined();
    });
    it('should serialize all properties other than winningUser, password, caller, and users as given', function() {
      var result = room.serialize();
      expect(result.winningUser).not.toBeDefined();
    });
  });
  describe('.addUser(user)', function() {
    it('should add the user object to the .users array', function() {
      var user = { username: "hehe" };
      room.addUser(user);
      expect(room.users.length).toEqual(1);
      expect(room.users[0]).toEqual(user);
    });
    it('should not add a user to the room if it already exists in the room', function() {
      var user = { username: "hehe" };
      var user2 = { username: "hehe2" };
      room.addUser(user);
      room.addUser(user2);
      expect(room.users[0]).toEqual(user);
      expect(room.users[1]).toEqual(user2);
      expect(room.users.length).toEqual(2);
      room.addUser(user);
      expect(room.users[0]).toEqual(user);
      expect(room.users.length).toEqual(2);
    });
  });
  describe('.removeUser(user)', function() {
    it('should remove the user from the .users array', function() {
      var user = { username: "hehe" };
      var user2 = { username: "hehe2" };
      room.users = [ user, user2 ];
      expect(room.users.length).toEqual(2);
      room.removeUser(user);
      expect(room.users.length).toEqual(1);
      expect(room.users[0]).toEqual(user2);
    });
  });
});
