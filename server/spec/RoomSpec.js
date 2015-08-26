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
      it("should set all users' property .answerSubmitted to true except the caller", function() {

      });
      it("should setState('callerSelectAnswer')", function() {
        
      });
    });
});
