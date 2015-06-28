var io = require('socket.io-client');
var should = require('should');
var r = require('rethinkdb');
var db = require('../../server/db');
var Combust = require('../Combust');
var config = require('./configTest.js');

var utils = config.utils;
var serverAddress = config.serverAddress;

var combustRef;
describe('authentication', function() {
  before(function(done) {
    config.resetDb(function() {
      done();
    })
  });

  beforeEach(function(done) {
    combustRef = new Combust({serverAddress: serverAddress});
    done();
  });

  after(function(done) {
    config.resetDb(function() {
      done();
    })
  });

  describe('newUser', function() {
    it('should create a new user', function(done) {
      combustRef.newUser(utils.testUser, function(response) {
        response.success.should.equal(true);
        response.status.should.equal(201);
        done();
      });
    });
    it('should not duplicate new users', function(done) {
      combustRef.newUser(utils.testUser, function(response) {
        response.success.should.equal(false);
        response.status.should.equal(401);
        done();
      });
    });
  });

  describe('authenticate', function() {
    it('should receive and store a web token when presenting valid credentials', function(done) {
      //uses already created user
      combustRef.authenticate(utils.testUser, function(response) {
        response.success.should.equal(true);
        response.status.should.equal(200);
        response.token.should.exist;
        combustRef.token.should.exist;
        done();
      });
    });
  });

  describe('initialize authenticated', function() {
    var newTest;
    it('should created an authenticated web socket connection when instantiated with valid credentials', function(done) {
      newTest = new Combust({serverAddress: serverAddress, auth: utils.testUser}, function(response) {
        response.token.should.exist;
        newTest.token.should.exist;
        response.success.should.equal(true);
        response.status.should.equal(200);
        done();
      });
    });
  });
});