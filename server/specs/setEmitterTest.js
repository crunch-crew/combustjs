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

xdescribe('setEmitter', function() {
  var insertDb = function(path, data, callback) {
    resetDb(function() {
      db.connect(function(conn) {
        bulkInsert(path, data, function() {
          callback();
        });
      })
    });
  }
  var socket;
  var agent;
  beforeEach(function(done) {
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

  var checkIfDone = function(events, done) {
    events.counter++;
    if (events.counter === events.limit) {
      done();
    }
  }

  describe('un-nested objects', function() {
    it('should find all the added properties between two objects', function(done) {
      var oldObj = {
        name: "Richie"
      }
      var newObj = {
        name: "Richie",
        school: "MKS"
      }
      // insertDb('/tests/one/two/', oldObj, function() {
      // socket.once('/tests/one/two/-setSuccess', function() {
      //   // setDifference('/tests/one/two/', newObj, function(results) {
      //     // results.addProps.should.eql([['/school/', 'MKS']]);
      //     // results.changeProps.should.eql([]);
      //     // results.deleteProps.should.eql([]);
      //     // results.emitEvents['/'].child_added.should.eql([{school: 'MKS'}]);
      //     // done();
      //   // socket.once('/test/-setSuccess', function() {
      //   //   socket.once('/messages/-getSuccess', function(data) {
      //   //     data.data.should.eql({testProperty: false});
      //   //     done();
      //   //   });
      // });
      socket.once('/tests/one/two/-setSuccess', function() {
        socket.once('/tests/one/two/-subscribeUrlValueSuccess', function() {
          socket.on('/tests/one/two/-value', function(newValue) {
            console.log(newValue);
            // done();
          });
          socket.emit('set', {path: '/tests/one/two/', data: newObj});
        });
        socket.emit('subscribeUrlValue', {url: '/tests/one/two/'});
      });
      socket.emit('set', {path: '/tests/one/two/', data: oldObj});
    });
  });

  xit('', function(done) {
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

  xit('', function(done) {
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

  xit('', function(done) {
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