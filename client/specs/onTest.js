var io = require('socket.io-client');
var should = require('should');
var r = require('rethinkdb');
var db = require('../../server/lib/db');
var Combust = require('../Combust');
var config = require('./configTest.js');

var utils = config.utils;
var serverAddress = config.serverAddress;

var socket;
var authRef;
describe('on', function() {
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

  it('should receive updates when children are added', function(done) {
    var timesCalled = 0;
    authRef = authRef.child('users');
    setTimeout(function() {
      authRef.push({username: 'otherUser'});
    },50);
    authRef.on('child_added', function(payload) {
      timesCalled++;
      if(timesCalled === 1) {
        payload.val().username.should.equal('authUser');
      }
      if(timesCalled === 2) {
        payload.val().username.should.equal('otherUser');
        done();
      }
    });
  });
});