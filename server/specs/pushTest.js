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

describe('push', function() {
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

  it('should push into the database', function(done) {
    socket.once('/messages/-pushSuccess', function(data) {
      done();
    });
    socket.emit('push', {path:'/messages/', data: utils.dummyObj});
  });

  it('should push into the database when parent path doesnt exist', function(done) {
    socket.once('/messages/hello/goodbye/imhere/-pushSuccess', function(data) {
      var key = data.key;
      socket.once('/messages/hello/goodbye/imhere/-getUrlSuccess', function(data) {
        data.data[key].should.eql(utils.dummyObj);
        done();
      });
      socket.emit('getUrl', {url: '/messages/hello/goodbye/imhere/'});
    });
    socket.emit('push', {path:'/messages/hello/goodbye/imhere/', data: utils.dummyObj});
  });

  xit('should push static properties properly', function(done) {
    socket.once('/messages/-pushSuccess', function(data) {
      should.exist(data);
      socket.once('/messages/' + data.key + '/-getUrlSuccess', function() {
        done();
      });
      socket.emit('getUrl', {url: '/messages/' + data.key + '/'});
    });
    socket.emit('push', {path:'/messages/', data: 'dummy-data'});
  });

});

