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
describe('update()', function() {
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

  it('should update values for existing keys in the object in database at the current path', function(done) {
    authRef.update(utils.testUpdateObj, function(response) {
      done();
    });
  });

  it('should insert new keys and values in database at the current path', function(done) {
    authRef.update(utils.testObj, function(response) {
      done();
    });
  });
});