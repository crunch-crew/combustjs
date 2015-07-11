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
var bulkInsert = require('./utils/bulkInsert');

var utils = configTest.utils;
var serverAddress = configTest.serverAddress;

describe('get', function() {
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

  it('should successfully get a url', function(done) {
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

  it('should successfuly get a static property at root', function(done) {
    bulkInsert('/', {activated: true}, function() {
      socket.once('/activated/-getUrlSuccess', function(data) {
        data.data.should.equal(true);
        done();
      });
      socket.emit('getUrl', {url: '/activated/'});
    });
  });

  it('should successfuly get a nested static property', function(done) {
    bulkInsert('/', {activated: {nested: {nestedActivated: false}}}, function() {
      socket.once('/activated/nested/nestedActivated/-getUrlSuccess', function(data) {
        data.data.should.equal(false);
        done();
      });
      socket.emit('getUrl', {url: '/activated/nested/nestedActivated/'});
    });
  });
});

