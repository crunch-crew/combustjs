var io = require('socket.io-client');
var r = require('rethinkdb');
var db = require('../db');
var should = require('should');
var supertest = require('supertest');
var configTest = require('./configTest');

var utils = configTest.utils;
var serverAddress = configTest.serverAddress;

describe('authorization', function() {
  var agent;
  var token;
  before(function(done) {
    socket = io.connect(configTest.serverAddress);

    //wipe db, signup user, store token
    db.connect(function(conn) {
      r.db(utils.dbName).table(utils.tableName).delete().run(conn, function(err, results) {
        r.db('test').table('test').insert({path: null, _id: '/'}).run(conn, function(err, results) {
          r.db('test').table('test').insert({path: '/', _id: 'users'}).run(conn, function(err, results) {

            agent = utils.createAgent(configTest.serverAddress);
              agent.post('/signup')
              .send(utils.testUser)
              .end(function(err, response) {
                if (err) throw err;
                else {
                  agent.post('/authenticate')
                    .send(utils.testUser)
                    .end(function(err, response) {
                      if (err) throw err;
                      else {
                        token = response.body.token;
                        done();
                      }
                    });
                }
              });
          });
        });
      });
    });
  });

  //wipe db
  after(function(done) {
    db.connect(function(conn) {
      r.db(utils.dbName).table(utils.tableName).delete().run(conn, function(err, results) {
        r.db('test').table('test').insert({path: null, _id: '/'}).run(conn, function(err, results) {
          r.db('test').table('test').insert({path: '/', _id: 'users'}).run(conn, done);
        });
      });
    });
  });

  it('should receive an error when attempting to access a protected route', function(done) {
    socket.emit("getUrl", {url: "/users/"});
    socket.once("/users/-getSuccess", function(data) {
      console.log(data);
      done();
    });
  });
});