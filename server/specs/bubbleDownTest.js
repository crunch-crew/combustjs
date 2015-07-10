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

describe('bubbleDown()', function() {
  var socket;
  var socket2;
  var agent;
  var agent2;
  beforeEach(function(done) {
    configTest.resetDb(function() {
      configTest.authenticateSocket(function(newSocket, newAgent) {
        socket = newSocket;
        agent = newAgent;
        configTest.authenticateSocket2(function(newSocket, newAgent) {
          socket2 = newSocket;
          agent2 = newAgent;
          done();
        });
      });
    });
  });

  afterEach(function(done) {
    socket2.disconnect();
    configTest.resetDb(function() {
      done();
    });
  });

  after(function(done) {
    socket.disconnect();
    socket2.disconnect();
    configTest.resetDb(function() {
      done();
    });
  });

  //subscribes to the room at all paths
  //sets value at the highest level of the paths 
  it('should bubble down value event', function(done) {
    var counter = 0;
    socket2.once('/-subscribeUrlValueSuccess', function() {
      socket2.once('/one/-subscribeUrlValueSuccess', function() {
        socket2.once('/one/two/-subscribeUrlValueSuccess', function() {
          socket2.once('/one/three/-subscribeUrlValueSuccess', function() {
            socket2.once('/one/three/four/-subscribeUrlValueSuccess', function() {
              socket2.on('/-value', function(data) {
                counter++;
              });
              socket2.on('/one/-value', function(data) {
                counter++;
                data.should.eql({two: true, three:{four: 'hello'}});
              });
              socket2.on('/one/two/-value', function(data) {
                counter++;
                data.should.eql(true);
              });
              socket2.on('/one/three/-value', function(data) {
                counter++;
                data.should.eql({four: 'hello'});
              });
              socket2.on('/one/three/four/-value', function(data) {
                counter++;
                data.should.eql('hello');
              });
              setTimeout(function() {
                if(counter === 5) {
                  done();
                }
              }, 500);
              socket.emit('set', {path:'/one/', data: {two: true, three:{four: 'hello'}}});
            });
            socket2.emit('subscribeUrlValue', {url: '/one/three/four/'});
          });
          socket2.emit('subscribeUrlValue', {url: '/one/three/'});
        });
        socket2.emit('subscribeUrlValue', {url: '/one/two/'});
      });
      socket2.emit('subscribeUrlValue', {url: '/one/'});
    });
    socket2.emit('subscribeUrlValue', {url: '/'});
  });

  it('should bubble down child_added event', function(done) {
    var counter = 0;
    socket2.once('/-subscribeUrlChildAddedSuccess', function() {
      socket2.once('/one/-subscribeUrlChildAddedSuccess', function() {
        socket2.once('/one/two/-subscribeUrlChildAddedSuccess', function() {
          socket2.once('/one/two/three/-subscribeUrlChildAddedSuccess', function() {
            socket2.once('/one/two/three/four/-subscribeUrlChildAddedSuccess', function() {
              socket2.on('/-child_added', function(data) {
                data.should.eql('SHOULD NOT REACH HERE!');
              });
              socket2.on('/one/-child_added', function(data) {
                counter++;
                data.should.eql({two: {three : {four: 'hello'}}});
              });
              socket2.on('/one/two/-child_added', function(data) {
                counter++;
                data.should.eql({three: {four: 'hello'}});
              });
              socket2.on('/one/two/three/-child_added', function(data) {
                counter++;
                data.should.eql({four: 'hello'});
              });
              setTimeout(function() {
                if(counter === 3) {
                  done();
                }
              }, 500);
              socket.emit('set', {path:'/one/', data: {two: {three:{four: 'hello'}}}});
            });
            socket2.emit('subscribeUrlChildAdded', {url: '/one/two/three/four/'});
          });
          socket2.emit('subscribeUrlChildAdded', {url: '/one/two/three/'});
        });
        socket2.emit('subscribeUrlChildAdded', {url: '/one/two/'});
      });
      socket2.emit('subscribeUrlChildAdded', {url: '/one/'});
    });
    socket2.emit('subscribeUrlChildAdded', {url: '/'});
  });

  it('should bubble down child_deleted event', function(done) {
    var counter = 0;
    socket.emit('set', {path:'/one/', data: {two: {three:{four: 'hello'}}}});

    socket2.once('/-subscribeUrlChildRemovedSuccess', function() {
      socket2.once('/one/-subscribeUrlChildRemovedSuccess', function() {
        socket2.once('/one/two/-subscribeUrlChildRemovedSuccess', function() {
          socket2.once('/one/two/three/-subscribeUrlChildRemovedSuccess', function() {
            socket2.once('/one/two/three/four/-subscribeUrlChildRemovedSuccess', function() {
              socket2.on('/-child_removed', function(data) {
                data.should.eql('SHOULD NOT REACH HERE');
              });
              socket2.on('/one/-child_removed', function(data) {
                counter++;
                data.should.eql({two: {three: {four : 'hello'}}});
              });
              socket2.on('/one/two/-child_removed', function(data) {
                counter++;
                data.should.eql({three: {four: 'hello'}});
              });
              socket2.on('/one/two/three/-child_removed', function(data) {
                counter++;
                data.should.eql({four: 'hello'});
              });
              setTimeout(function() {
                if(counter === 3) {
                  done();
                }
              }, 500);
              socket.emit('set', {path:'/one/', data: {}});
            });
            socket2.emit('subscribeUrlChildRemoved', {url: '/one/two/three/four/'});
          });
          socket2.emit('subscribeUrlChildRemoved', {url: '/one/two/three/'});
        });
        socket2.emit('subscribeUrlChildRemoved', {url: '/one/two/'});
      });
      socket2.emit('subscribeUrlChildRemoved', {url: '/one/'});
    });
    socket2.emit('subscribeUrlChildRemoved', {url: '/'});
  });
});