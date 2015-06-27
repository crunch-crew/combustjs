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



describe('delete', function() {
  var socket;
  var agent;
  before(function(done) {
    configTest.resetDb(function() {
      configTest.authenticateSocket(function(newSocket, newAgent) {
        socket = newSocket;
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

  it('should hear for a delete event and then remove a path from the database', function(done) {
    socket.once('/messages/-setSuccess', function() {
      socket.emit('delete', {path: '/messages/', data: {msg2: {from: 'joe'}}});
    });
    socket.once('/messages/-deleteSuccess', function() {
      socket.emit('getUrl', {url: '/messages/'});
    })
    socket.once('/messages/-getSuccess', function(response) {
      response.data.should.eql({msg1: {from: 'alex'}, room: 'main'});
      done();
    })
    socket.emit('set', {path: '/messages/', data: {msg1: {from: 'alex'}, msg2: {from: 'joe'}, room: 'main'}});
  });

});
