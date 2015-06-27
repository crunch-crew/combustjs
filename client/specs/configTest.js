var io = require('socket.io-client');
var should = require('should');
var r = require('rethinkdb');
var db = require('../../server/db');
var Combust = require('../Combust.js');
var config = require('./configTest.js');

module.exports = {
  serverAddress: 'http://0.0.0.0:3000',
  utils: {
    dbName: 'test',
    tableName: 'test',
    newCombust: function(socket) {
      return new Combust({
        dbName: this.dbName,
        tableName: this.tableName,
        socket: socket,
        io: io,
        serverAddress: this.serverAddress
      });
    },
    newAuthCombust: function() {
      return new Combust({
        dbName: this.dbName,
        tableName: this.tableName,
        io: io,
        serverAddress: this.serverAddress
      });
    },
    testObj: {
      users: {
        user1: {
          name: "richie"
        },
        user2: {
          name: "kuldeep"
        },
        user: {
          name: "jack"
        }
      },
      activated: true,
      messedUp: false,
      test: {
        name: "viable"
      }
    },
    testUser: {
      username: "testUser",
      password: "testPassword",
      email: "testEmail"
    },
    authUser: {
      username: "authUser",
      password: "authPassword",
      email: "authEmail"
    },
    testUpdateObj: {
      users: {
        user1: {
          name: "richie Updated"
        },
        user2: {
          name: "kuldeep Updated"
        },
        user3: {
          name: "jack"
        },
        user4: {
          name: "new insert"
        }
      },
      activated: false,
      messedUp: false,
      test: {
        name: "viable not"
      }
    }
  },
  resetDb: function(callback) {
    var that = this;
    db.connect(function(conn) {
      r.db(that.utils.dbName).table(that.utils.tableName).delete().run(conn, function(err, cursor) {
        if (err) throw err;
        r.db(that.utils.dbName).table(that.utils.tableName).insert({path: null, _id: '/'}).run(conn, function(err, cursor) {
          r.db(that.utils.dbName).table(that.utils.tableName).insert({path: '/', _id: 'users'}).run(conn, function(err, cursor) {
            if (err) throw (err);
            callback();
          });
        });
      });
    });
  },
  combustToken: function(callback) {
    var that = this;
    //create a user to use for tests that require authentication
    authRef = that.utils.newAuthCombust();
    authRef.newUser(that.utils.authUser, function(response) {
      if (response.success) {
        authRef.authenticate(that.utils.authUser, function(response) {
          socket = io.connect(that.serverAddress, {
            forceNew: true,
            //send the web token with the initial websocket handshake
            query: 'token=' + response.token
          });
          authRef.socket = socket;
          socket.on('connectSuccess', function() {
            callback(authRef);
          });
        });
      }
    });
  }
}