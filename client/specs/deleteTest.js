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
describe('delete()', function() {
  before(function(done) {
    config.resetDb(function() {
      config.combustToken(function(authenticatedCombust) {
        authRef = authenticatedCombust;
        socket = authRef.socket;
        done();
      });
    });
  });

  after(function(done) {
    config.resetDb(function() {   
      socket.disconnect();
      done();
    })
  });

  describe('delete()', function() {
    it('should emit a socket event to the server', function(done) {
      authRef.delete(utils.testObj, function() {
        done();
      });
    });
  });
});