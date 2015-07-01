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

xdescribe('delete', function() {
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

 beforeEach(function(done) {
   var rows = parseToRows({msg1: {from:'mom'}, msg2: {from: 'dad'}, room: 'main'}, '/user5/', 'messages');
   db.connect(function(conn) {
     r.db(utils.dbName).table(utils.tableName).insert({path: '/', _id: 'user5'}).run(conn, function(err, results) {
       if (err) throw err;
       r.db(utils.dbName).table(utils.tableName).insert(rows).run(conn, function(err, results) {
         if (err) throw err;
         done();
       })
     });
   });
 });

 after(function(done) {
   configTest.resetDb(function() {
     done();
   });
 });

 it('should delete static properties', function(done) {
   socket.once('/user5/messages/room/-deleteSuccess', function() {
     db.connect(function(conn) {
       r.db(utils.dbName).table(utils.tableName).filter({path: '/user5/', _id: 'messages'}).run(conn, function(err, cursor) {
         if (err) throw err;
         cursor.toArray(function(err, array) {
           if (err) throw err;
           array[0].should.not.have.property('room');
           done();
         });
       });
     });
   });
   socket.emit('delete', {path: '/user5/messages/room/'});
 });

 it('should delete nested objects', function(done) {
   socket.once('/user5/messages/-deleteSuccess', function() {
     db.connect(function(conn) {
       //check if root node was deleted
       r.db(utils.dbName).table(utils.tableName).filter({path: '/user5/', _id: 'messages'}).run(conn, function(err, cursor) {
         if (err) throw err;
         cursor.toArray(function(err, array) {
           if (err) throw err;
           //check if children were deleted
           r.db(utils.dbName).table(utils.tableName).filter(r.row('path').match('/user5/messages/*')).run(conn, function(err, cursor) {
             if (err) throw err;
             cursor.toArray(function(err, array) {
               var results = array[0];
               should(results).be.undefined;
               done();
             });
           });
         });
       });
     });
   });
   socket.emit('delete', {path: '/user5/messages/'});
 });
});