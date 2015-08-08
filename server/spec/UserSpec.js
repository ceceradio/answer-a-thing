var User = require('../User.js');
describe("User", function() {
  var user;
  var song;

  beforeEach(function() {
    user = new User();
  });

  it("should initialize important game data to false or empty objects", function() {
    expect(user.bets).toEqual(false);
    expect(user.drawboard).toEqual({});
    expect(user.room).toEqual(false);
    expect(user.answerSubmitted).toEqual(false);
  });

  describe("serialize(notRecursive)", function() {
    beforeEach(function() {
      user.socket = "testDon'tWork";
      user.username = "name";
      user.accessToken = "access";
      user.bets = ['test1', 'test2'];
      user.drawboard = { data: 'test' };
      user.room = false;
      user.answerSubmitted = true;
    });

    it("should serialize the main user data into json.stringify-able object", function() {
      var output = user.serialize();
      expect(output.username).toEqual(user.username);
      expect(output.accessToken).not.toBeDefined();
      expect(output.socket).not.toBeDefined();
      expect(output.room).toEqual(false);
      expect(output.drawboard).toEqual(user.drawboard);
      expect(output.bets).toEqual(user.bets);
    });

    it("should call user.room.serialize() if Room is defined and notRecursive is undefined", function() {
      user.room = { serialize: function() {} };
      spyOn(user.room, 'serialize');
      var output = user.serialize();
      expect(user.room.serialize).toHaveBeenCalled();
    });

    it("should not include user.room or call user.room.serialize() if notRecursive is true", function() {
      user.room = { serialize: function() {} };
      spyOn(user.room, 'serialize');
      var output = user.serialize(true);
      expect(user.room.serialize).not.toHaveBeenCalled();
      expect(output.room).not.toBeDefined();
    });
  });
  describe('createRoom()', function() {

  });
});
