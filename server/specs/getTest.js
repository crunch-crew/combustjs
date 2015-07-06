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

describe('get', function() {
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
    socket.disconnect();
    configTest.resetDb(function() {
      done();
    });
  });

  it('should successfully get an url', function(done) {
    socket.emit('push', {path:'/', data: utils.testObj});
    socket.once('/-pushSuccess', function(data) {
      var path = '/' + data.key + '/';
      socket.emit('getUrl', {url: path});
      socket.once(path + '-getUrlSuccess', function(data) {
          data.data.should.eql(utils.testObj);
          done();
      });
    });
  });
});

