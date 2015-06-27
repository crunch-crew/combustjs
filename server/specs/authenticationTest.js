var io = require('socket.io-client');
var r = require('rethinkdb');
var db = require('../db');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var should = require('should');
var supertest = require('supertest');
var configTest = require('./configTest');

var utils = configTest.utils;
var serverAddress = configTest.serverAddress;

describe('user management', function() {
  var socket;
  var agent;
  before(function(done) {
    configTest.resetDb(function() {
      configTest.authenticateSocket(function(socket, newAgent) {
        socket = socket;
        agent = newAgent;
        done();
      });
    });
  });

  after(function(done) {
    configTest.resetDb(function() {
      done();
    });
  });

  it('should create a new user on signup', function(done) {
  agent
    .post('/signup')
    .send(utils.testUser)
    .expect(201)
    .expect(function(res) {
      //checks if inserting the user was successful
      res.body.success.should.equal(true);
    })
    .end(function(err, response) {
      if (err) throw err;
      else {
        //makes sure a user cant be duplicated
        agent
          .post('/signup')
          .send(utils.testUser)
          .expect(401)
          .end(function(err, response) {
            if (err) throw err;
            else {
              done();
            }
          });
      }
    });
  });

  it('should authenticate valid credentials and return a json web token', function(done) {
    agent.post('/authenticate')
    .send(utils.testUser)
    .expect(200)
    .expect(function(res) {
      res.body.success.should.equal(true);
      res.body.token.should.exist;
    })
    .end(function(err, response) {
      if (err) throw err;
      else {
        done();
      }
    });
  });

  it('should not authenticate invalid credentials', function(done) {
    agent.post('/authenticate')
    .send({
      username: "testUser",
      password: "badPassword",
    })
    .expect(400)
    .expect(function(res) {
      res.body.success.should.equal(false);
    })
    .end(function(err, response) {
      if (err) throw err;
      else {
        done();
      }
    });
  });
});

