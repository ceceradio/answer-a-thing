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
    it('should not allow a bettor to bet on the caller', function() {
    });
    it('should not allow a callor to be a bettor', function() {
    });
    it('should not allow a user not in the room to bet', function() {
    });
    it('should not allow a user to bet more than the maximum amount', function() {
    });
    it('should add the user to the bets', function() {
    });
    it('should execute function to set state to submit all bets if all bets are submitted', function() {
    });
  })
});
