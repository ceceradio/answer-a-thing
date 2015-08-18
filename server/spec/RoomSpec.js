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
      it("should call resetBets()", function() {

      });
      it("should select a new caller from the users in the room sequentially, starting with user 0", function() {

      });
      it("should populate the questions", function() {

      });
      it("should setState('callerSelectQuestion')", function() {

      });
    });
});
