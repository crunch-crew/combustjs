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

xdescribe('setEmitter', function() {
  var socket;
  var agent;
  beforeEach(function(done) {
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

  var checkIfDone = function(events, done) {
    events.counter++;
    if (events.counter === events.limit) {
      done();
    }
  }

  it('', function(done) {
    var events = {
      counter: 0,
      limit: 2
    }
    socket.once('/messages/-value', function() {
      // console.log('messages value');
      checkIfDone(events,done);
    });

    socket.once('/-value', function() {
      // console.log('root value');
      checkIfDone(events, done);
    });
    socket.emit('set', {path:'/messages/', data: {testProperty: false}});
  });

  it('', function(done) {
    var events = {
      counter: 0,
      limit: 2
    }
    socket.once('/messages/-value', function() {
      checkIfDone(events,done);
    });

    socket.once('/-value', function() {
      checkIfDone(events, done);
    });
    socket.emit('set', {path:'/messages/', data: {testProperty: false, activated: true}});
  });

  it('', function(done) {
    var events = {
      counter: 0,
      limit: 5
    }
    socket.once('/-value', function() {
      checkIfDone(events,done);
    }); 
    socket.once('/one/-value', function() {
      checkIfDone(events,done);
    });
    socket.once('/one/two/-value', function() {
      checkIfDone(events,done);
    });
    socket.once('/one/two/three/-value', function() {
      checkIfDone(events,done);
    });
    socket.once('/one/two/three/four/-value', function(data) {
      checkIfDone(events,done);
    });
    socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true, testSomething:{testProp: 'hello'}}});
  });

  xit('', function(done) {
    it('should remove static properties at a specified path and emit success', function(done) {
      socket.once('/one/two/three/four/-setSuccess', function() {
        socket.once('/one/two/three/four/-setSuccess', function() {
          socket.once('/one/two/three/four/-getSuccess', function(data) {
              data.data.should.eql({testSomething:{testProp: 'hello'}})
            done();
          });
          socket.emit('getUrl', {url: '/one/two/three/four/'});
        });
        socket.emit('set', {path:'/one/two/three/four/', data: {testSomething:{testProp: 'hello'}}});
      });
      socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true, testSomething:{testProp: 'hello'}}});
    });
  });
});