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

  //TODO: needs a test for setting at paths that only half exist

  it('should set un-nested data to a specified path and emit success', function(done) {
    socket.once('/messages/-setSuccess', function() {
      socket.once('/messages/-getUrlSuccess', function(data) {
        data.data.should.eql({testProperty: false});
        done();
      });
      socket.emit('getUrl', {url: '/messages/'});
    });
    socket.emit('set', {path:'/messages/', data: {testProperty: false}});
  });

  it('should set multiple un-nested data to a specified path and emit success', function(done) {
    socket.once('/messages/-setSuccess', function() {
      socket.once('/messages/-getUrlSuccess', function(data) {
        data.data.should.eql({testProperty: false, activated: true});
        done();
      });
      socket.emit('getUrl', {url: '/messages/'});
    });
    socket.emit('set', {path:'/messages/', data: {testProperty: false, activated: true}});
  });

  it('should set nested data to a specified path and emit success', function(done) {
    socket.once('/messages/-setSuccess', function() {
      socket.once('/messages/-getUrlSuccess', function(data) {
        data.data.should.eql({testProperty: true, testSomething:{testProp: 'hello'}});
        done();
      });
      socket.emit('getUrl', {url: '/messages/'});
    });
    socket.emit('set', {path:'/messages/', data: {testProperty: true, testSomething:{testProp: 'hello'}}});
  });

  it('should set nested data to a nested path that didn\'t exist previously (creates intermediary paths with empty objects) and emit success', function(done) {
    socket.once('/one/two/three/four/-setSuccess', function() {
      socket.once('/one/two/three/four/-getUrlSuccess', function(data) {
        data.data.should.eql({testProperty: true, testSomething:{testProp: 'hello'}})
        done();
      });
      socket.emit('getUrl', {url: '/one/two/three/four/'});
    });
    socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true, testSomething:{testProp: 'hello'}}});
  });

  it('should remove static properties at a specified path and emit success', function(done) {
    socket.once('/one/two/three/four/-setSuccess', function() {
      socket.once('/one/two/three/four/-setSuccess', function() {
        socket.once('/one/two/three/four/-getUrlSuccess', function(data) {
            data.data.should.eql({testSomething:{testProp: 'hello'}})
          done();
        });
        socket.emit('getUrl', {url: '/one/two/three/four/'});
      });
      socket.emit('set', {path:'/one/two/three/four/', data: {testSomething:{testProp: 'hello'}}});
    });
    socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true, testSomething:{testProp: 'hello'}}});
  });

  it('should remove nested static properties at a specified path and emit success', function(done) {
    socket.once('/one/two/three/four/-setSuccess', function() {
      socket.once('/one/two/three/four/-setSuccess', function() {
        socket.once('/one/two/three/four/-getUrlSuccess', function(data) {
            data.data.should.eql({testProperty: true, testSomething:{}});
          done();
        });
        socket.emit('getUrl', {url: '/one/two/three/four/'});
      });
      socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true, testSomething:{}}});
    });
    socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true, testSomething:{testProp: 'hello'}}});
  });

  it('should remove nested properties at a specified path and emit success', function(done) {
    socket.once('/one/two/three/four/-setSuccess', function() {
      socket.once('/one/two/three/four/-setSuccess', function() {
        socket.once('/one/two/three/four/-getUrlSuccess', function(data) {
            data.data.should.eql({testProperty: true});
          done();
        });
        socket.emit('getUrl', {url: '/one/two/three/four/'});
      });
      socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true}});
    });
    socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true, testSomething:{testProp: 'hello'}}});
  });

  it('should remove multiple static properties at a specified path and emit success', function(done) {
    socket.once('/one/two/three/four/-setSuccess', function() {
      socket.once('/one/two/three/four/-setSuccess', function() {
        socket.once('/one/two/three/four/-getUrlSuccess', function(data) {
            data.data.should.eql({testSomething:{}});
          done();
        });
        socket.emit('getUrl', {url: '/one/two/three/four/'});
      });
      socket.emit('set', {path:'/one/two/three/four/', data: {testSomething:{}}});
    });
    socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true, activated: false, testSomething:{testProp: 'hello'}}});
  });

  it('should change static properties at a specified path and emit success', function(done) {
    socket.once('/one/two/three/four/-setSuccess', function() {
      socket.once('/one/two/three/four/-setSuccess', function() {
        socket.once('/one/two/three/four/-getUrlSuccess', function(data) {
            data.data.should.eql({testProperty: false, testSomething:{testProp: 'hello'}})
          done();
        });
        socket.emit('getUrl', {url: '/one/two/three/four/'});
      });
      socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: false, testSomething:{testProp: 'hello'}}});
    });
    socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true, testSomething:{testProp: 'hello'}}});
  });

  it('should change nested static properties at a specified path and emit success', function(done) {
    socket.once('/one/two/three/four/-setSuccess', function() {
      socket.once('/one/two/three/four/-setSuccess', function() {
        socket.once('/one/two/three/four/-getUrlSuccess', function(data) {
            data.data.should.eql({testProperty: true, testSomething:{testProp: 'yo'}});
          done();
        });
        socket.emit('getUrl', {url: '/one/two/three/four/'});
      });
      socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true, testSomething:{testProp: 'yo'}}});
    });
    socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true, testSomething:{testProp: 'hello'}}});
  });

  it('should change nested properties at a specified path and emit success', function(done) {
    socket.once('/one/two/three/four/-setSuccess', function() {
      socket.once('/one/two/three/four/-setSuccess', function() {
        socket.once('/one/two/three/four/-getUrlSuccess', function(data) {
            data.data.should.eql({testProperty: true, testSomething:{greeting: 'hi'}});
            done();
        });
        socket.emit('getUrl', {url: '/one/two/three/four/'});
      });
      socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true, testSomething:{greeting: 'hi'}}});
    });
    socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true, testSomething:{testProp: 'hello'}}});
  });

  it('should change multiple nested static properties at a specified path and emit success', function(done) {
    socket.once('/one/two/three/four/-setSuccess', function() {
      socket.once('/one/two/three/four/-setSuccess', function() {
        socket.once('/one/two/three/four/-getUrlSuccess', function(data) {
            data.data.should.eql({testProperty: false, activated: true, testSomething:{testProp: 'yo'}});
          done();
        });
        socket.emit('getUrl', {url: '/one/two/three/four/'});
      });
      socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: false, activated: true, testSomething:{testProp: 'yo'}}});
    });
    socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true, activated: false, testSomething:{testProp: 'hello'}}});
  });

  it('should change multiple nested static properties at a root path and emit success', function(done) {
    socket.once('/-setSuccess', function() {
      socket.once('/-setSuccess', function() {
        socket.once('/-getUrlSuccess', function(data) {
            data.data.should.eql({testProperty: false, activated: true, testSomething:{testProp: 'yo'}});
          done();
        });
        socket.emit('getUrl', {url: '/'});
      });
      socket.emit('set', {path:'/', data: {testProperty: false, activated: true, testSomething:{testProp: 'yo'}}});
    });
    socket.emit('set', {path:'/', data: {testProperty: true, activated: false, testSomething:{testProp: 'hello'}}});
  });
});

