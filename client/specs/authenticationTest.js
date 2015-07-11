var io = require('socket.io-client');
var should = require('should');
var r = require('rethinkdb');
var db = require('../../server/lib/db');
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
      authenticatedCombust = new Combust({serverAddress: serverAddress, auth: utils.testUser}, function(response) {
        response.token.should.exist;
        authenticatedCombust.token.should.exist;
        authenticatedCombust.socket.should.exist;
        response.success.should.equal(true);
        response.status.should.equal(200);
        done();
      });
    });
  });

  //not tested - difficult to test localStorage in mocha
  describe('authentication local storage', function() {
    xit('should automatically store the JSON web token in local storage', function(done) {
    });

    xit('should retrieve a token from local storage (if it exists) upon initialization', function(done) {

    });

    xit('should establish a connection using the token retrieved from local storage', function(done) {

    });

    xit('should delete the token when the unauthenticate method is called', function(done) {

    });

    xit('should gracefully re-authenticate if the server declares the token to be expired', function(done) {

    });
  });
});