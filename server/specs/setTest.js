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

describe('set', function() {
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
  it('should delete children of the path that is being set and set path to passed data', function(done) {
    socket.once('/messages/-setSuccess', function() {
      socket.once('/messages/-getSuccess', function(data) {
        data.data.should.eql({testProperty: false});
        done();
      });
      socket.emit('getUrl', {url: '/messages/'});
    });
    socket.emit('set', {path:'/messages/', data: {testProperty: false}});
  });

  it('should set to paths in the database', function(done) {
    socket.once('/messages/-setSuccess', function() {
      socket.once('/messages/-getSuccess', function(data) {
        data.data.should.eql({testProperty: true, testSomething:{testProp: 'hello'}});
        done();
      });
      socket.emit('getUrl', {url: '/messages/'});
    });
    socket.emit('set', {path:'/messages/', data: {testProperty: true, testSomething:{testProp: 'hello'}}});
  });

});

