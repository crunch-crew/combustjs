var io = require('socket.io-client');
var should = require('should');
var r = require('rethinkdb');
var db = require('../../server/db');
var Combust = require('../Combust');
var config = require('./configTest.js');

var utils = config.utils;
var serverAddress = config.serverAddress;

var socket;
var authRef;
describe('push()', function() {
  before(function(done) {
    config.resetDb(function() {
      config.combustToken(function(authenticatedCombust) {
        authRef = authenticatedCombust;
        socket = authRef.socket;
        done();
      })
    })
  });

  after(function(done) {
    config.resetDb(function() {
      socket.disconnect();
      done();
    })
  });

  it('should push an object into the database at the current path', function(done) {
    authRef.push(utils.testObj, function(response) {
      done();
    });
  });

  it('should return a new combust object that references the new url', function(done) {
    var newRef = authRef.push(utils.testObj, function(response) {
      response.created.should.equal(true);
      newRef.pathArray.should.eql(['/', response.key]);
      newRef.should.not.equal(authRef);
      done();
    });
  });
});