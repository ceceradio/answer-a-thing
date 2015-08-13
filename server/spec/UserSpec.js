var User = require('../User.js');
var Room = require('../Room.js');
var rooms;
describe("User", function() {
  var user;

  beforeEach(function() {
    user = new User();
    // clear the rooms
    rooms = Room.getRooms();
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
  describe('createRoom(roomName)', function() {
    var roomName = 'testroom';
    beforeEach(function() {
      // reset the state
      user.room = false;
      delete rooms[roomName];
    });
    it('should not create a room if it already exists', function() {
      rooms[roomName] = "test";
      expect(user.createRoom(roomName)).toEqual("A room with this name already exists.");
      expect(user.room).toEqual(false);
    });
    it('should not create a room if the user is already in a room', function() {
      user.room = 'test';
      expect(user.createRoom(roomName)).toEqual("You must leave your current room.");
      expect(user.room).toEqual('test');
    });
    it('should create a room and put the user in it if the room and user', function() {
      expect(user.createRoom(roomName)).toEqual(true);
      expect(user.room).toBeDefined();
      expect(user.room.name).toEqual(roomName);
      expect(user.room.users).toContain(user);
    });
  });
  describe('joinRoom(roomName)', function() {
    var roomName = 'testroom';
    beforeEach(function() {
      // reset the state
      user.room = false;
      delete rooms[roomName];
    });
    it("should fail if the room doesn't exist", function() {
      expect(user.joinRoom(roomName)).toEqual("This room does not exist.");
      expect(user.room).toEqual(false);
    });
    it("should not create a room if the user is already in a room", function() {
      user.room = 'test';
      rooms[roomName] = 'occupied';
      expect(user.joinRoom(roomName)).toEqual("You must leave your current room.");
      expect(user.room).toEqual('test');
    });
    it('should put the user in an existing room', function() {
      rooms[roomName] = new Room(roomName);
      expect(user.joinRoom(roomName)).toEqual(true);
      expect(user.room.name).toEqual(roomName);
      expect(user.room.users).toContain(user);
    });
  });
});
