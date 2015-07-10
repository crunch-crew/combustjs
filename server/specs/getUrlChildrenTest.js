var io = require('socket.io-client');
var r = require('rethinkdb');
var db = require('../db');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var should = require('should');
var supertest = require('supertest');
var configTest = require('./configTest');
var resetDb = require('./utils/resetDb');
var authenticateSocket = require('./utils/authenticateSocket');

var utils = configTest.utils;
var serverAddress = configTest.serverAddress;

describe('getUrlChildren', function() {
  var socket;
  var agent;
  before(function(done) {
    resetDb(function() {
      authenticateSocket(function(newSocket, newAgent) {
        socket = newSocket;
        agent = newAgent;
        done();
      });
    });
  });

  after(function(done) {
    socket.disconnect();
    resetDb(function() {
      done();
    });
  });

  it('should return an array with getUrlChildren', function(done) {
    socket.once('/-getUrlChildrenSuccess', function(data) {
      if(Array.isArray(data)) {
        done();
      }
    });
    socket.emit('getUrlChildren', {url: '/'});
  });
});

