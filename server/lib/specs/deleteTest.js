var io = require('socket.io-client');
var r = require('../db');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var should = require('should');
var supertest = require('supertest');
var configTest = require('./configTest');
var resetDb = require('./utils/resetDb');
var authenticateSocket = require('./utils/authenticateSocket');

var utils = configTest.utils;
var serverAddress = configTest.serverAddress;

describe('delete', function() {
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

 beforeEach(function(done) {
   var rows = parseToRows({msg1: {from:'mom'}, msg2: {from: 'dad'}, room: 'main'}, '/user5/', 'messages');
   r.db(utils.dbName).table(utils.tableName).insert({path: '/', _id: 'user5'}).run().then(function(results) {
     r.db(utils.dbName).table(utils.tableName).insert(rows).run().then(function(results) {
       done();
     })
   });
 });

 after(function(done) {
  resetDb(function() {
    done();
  });
 });

 it('should delete static properties', function(done) {
   socket.once('/user5/messages/room/-deleteSuccess', function() {
     r.db(utils.dbName).table(utils.tableName).filter({path: '/user5/', _id: 'messages'}).run().then(function(result) {
       result[0].should.not.have.property('room');
       done();
     });
   });
   socket.emit('delete', {path: '/user5/messages/room/'});
 });

 it('should delete nested objects', function(done) {
    socket.once('/user5/messages/-deleteSuccess', function() {
     //check if root node was deleted
     r.db(utils.dbName).table(utils.tableName).filter({path: '/user5/', _id: 'messages'}).run().then(function(result) {
       //check if children were deleted
       r.db(utils.dbName).table(utils.tableName).filter(r.row('path').match('/user5/messages/*')).run().then(function(result) {
         var results = result[0];
         should(results).be.undefined;
         done();
       });
     });
   });
   socket.emit('delete', {path: '/user5/messages/'});
 });
});