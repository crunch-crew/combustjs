var io = require('socket.io-client');
var r = require('rethinkdb');
var db = require('../db');
var supertest = require('supertest');

module.exports = {
  serverAddress: 'http://127.0.0.1:3000',
  utils: {
    dbName: 'test',
    tableName: 'test',
    testObj: {
      users: {
        user1: {
          name: "richie"
        },
        user2: {
          name: "kuldeep"
        },
        user: {
          name: "jack",
          something: ['hi', {something: 'hi'}]
        }
      },
      activated: true,
      messedUp: false,
      test: {
        name: "viable"
      }
    },
    dummyObj: {
      users: {
        user1: {
          name: "richie"
        },
        user2: {
          name: "kuldeep"
        },
        user: {
          name: "jack",
          something: ['hi', {something: 'hi'}]
        }
      },
      activated: true,
      messedUp: false,
      test: {
        name: "viable"
      }
    },
    testRows: {
      testRoot: { path: '/root/', _id: 'testObj', activated: true, messedUp: false },
      testChildren: [ 
        { path: '/root/testObj/users/', _id: 'user1', name: 'richie' },
          { path: '/root/testObj/users/', _id: 'user2', name: 'kuldeep' },
          { path: '/root/testObj/users/user/something/', _id: '1', something: 'hi', _partArray: true },
          { '0': 'hi', path: '/root/testObj/users/user/', _id: 'something', _isArray: true, _length: 2 },
          { path: '/root/testObj/users/', _id: 'user', name: 'jack' },
          { path: '/root/testObj/', _id: 'users' },
          { path: '/root/testObj/', _id: 'test', name: 'viable' }
      ]
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
    createAgent: function(server) {
      var server = server || this.serverAddress;
      return supertest.agent(server);
    },
  },
  authenticateSocket: function(callback) {
    var agent = this.utils.createAgent(this.serverAddress);
    var that = this;
      agent.post('/signup').send(that.utils.authUser).expect(201).end(function(err, response) {
        if (err) throw err;
        else {
          agent.post('/authenticate').send(that.utils.authUser).expect(200).end(function(err, response) {
            //store the web token
            token = response.body.token;
            if (err) throw err;
            else {
              //authenticate the client with the webtoken - used for remaining tests
              socket = io.connect(that.serverAddress, {
                forceNew: true,
                //send the web token with the initial websocket handshake
                query: 'token=' + token
              });
              socket.on('connectSuccess', function() {
                callback(socket, agent);
              });
            }
          });
        }
      });
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
  }
}