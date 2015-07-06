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

describe('listeners', function() {
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

  it('should notify listeners of parent urls of value changes once', function(done) {
    var counter = 0;
    socket.once('/-subscribeUrlValueSuccess', function() {
      socket.on('/-value', function(data) {
        counter++;
        setTimeout(function(){
          if(counter === 1) {
            if(data) {
              done();
            }
          }
        }, 200);
      });
    });    
    socket.emit('set', {path:'/users/', data: {testProperty: true, testSomething:{testProp: 'hallo'}}})
    socket.emit('subscribeUrlValue', {url: '/'});
  }); 

  it('should receive updates when a child is added to a url', function(done) {
    socket.once('/messages/-child_added', function(data) {
      data.should.eql(utils.testObj);
      done();
    });
    socket.on('/messages/-subscribeUrlChildAddedSuccess', function(response) {
      socket.emit('push', {path:'/messages/', data: utils.dummyObj});
    });
    socket.emit('subscribeUrlChildAdded', {url: '/messages/'});
  });
});

