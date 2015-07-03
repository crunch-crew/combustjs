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

  xit('should set un-nested data to a specified path and emit success', function(done) {
    socket.once('/messages/-setSuccess', function() {
      socket.once('/messages/-getSuccess', function(data) {
        data.data.should.eql({testProperty: false});
        done();
      });
      socket.emit('getUrl', {url: '/messages/'});
    });
    socket.emit('set', {path:'/messages/', data: {testProperty: false}});
  });

  xit('should set nested data to a specified path and emit success', function(done) {
    socket.once('/messages/-setSuccess', function() {
      socket.once('/messages/-getSuccess', function(data) {
        data.data.should.eql({testProperty: true, testSomething:{testProp: 'hello'}});
        done();
      });
      socket.emit('getUrl', {url: '/messages/'});
    });
    socket.emit('set', {path:'/messages/', data: {testProperty: true, testSomething:{testProp: 'hello'}}});
  });

  xit('should set nested data to a nested path that didn\'t exist previously (creates intermediary paths with empty objects) and emit success', function(done) {
    socket.once('/one/two/three/four/-setSuccess', function() {
      socket.once('/one/two/three/four/-getSuccess', function(data) {
        data.data.should.eql({testProperty: true, testSomething:{testProp: 'hello'}})
        done();
      });
      socket.emit('getUrl', {url: '/one/two/three/four/'});
    });
    socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true, testSomething:{testProp: 'hello'}}});
  });

  xit('should remove static properties at a specified path and emit success', function(done) {
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

  xit('should remove nested properties at a specified path and emit success', function(done) {
    socket.once('/one/two/three/four/-setSuccess', function() {
      socket.once('/one/two/three/four/-setSuccess', function() {
        socket.once('/one/two/three/four/-getSuccess', function(data) {
            data.data.should.eql({testProperty: true});
          done();
        });
        socket.emit('getUrl', {url: '/one/two/three/four/'});
      });
      socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true}});
    });
    socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true, testSomething:{testProp: 'hello'}}});
  });

  it('should change static properties at a specified path and emit success', function(done) {
    socket.once('/one/two/three/four/-setSuccess', function() {
      socket.once('/one/two/three/four/-setSuccess', function() {
        socket.once('/one/two/three/four/-getSuccess', function(data) {
            data.data.should.eql({testProperty: false, testSomething:{testProp: 'hello'}})
          done();
        });
        socket.emit('getUrl', {url: '/one/two/three/four/'});
      });
      socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: false, testSomething:{testProp: 'hello'}}});
    });
    socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true, testSomething:{testProp: 'hello'}}});
  });

  it('should change nested properties at a specified path and emit success', function(done) {
    socket.once('/one/two/three/four/-setSuccess', function() {
      socket.once('/one/two/three/four/-setSuccess', function() {
        socket.once('/one/two/three/four/-getSuccess', function(data) {
            data.data.should.eql({testProperty: true, testSomething:{testProp: 'yo'}});
          done();
        });
        socket.emit('getUrl', {url: '/one/two/three/four/'});
      });
      socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true, testSomething:{testProp: 'yo'}}});
    });
    socket.emit('set', {path:'/one/two/three/four/', data: {testProperty: true, testSomething:{testProp: 'hello'}}});
  });

});

