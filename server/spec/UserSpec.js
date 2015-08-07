var User = require('../User.js');
describe("Player", function() {
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

  });
});
