var io = require('socket.io-client');
var should = require('should');
var r = require('rethinkdb');
var db = require('../../server/db');
var Combust = require('../Combust');
var config = require('./configTest.js');

var utils = config.utils;
var serverAddress = config.serverAddress;

describe('Non-networking', function() {
  var combustRef;
  beforeEach(function(done) {
    combustRef = utils.newCombust();
    done();
  });

  describe('intialization', function() {
    it('should initialize properly based on the passed parameters', function(done) {
      combustRef.dbName.should.equal('test');
      combustRef.tableName.should.equal('test');
      combustRef.pathArray.should.eql(['/']);
      done();
    });
  });

  describe('child()', function() {

    it('should change the referenced path when called', function(done) {
      combustRef.child('users');
      combustRef.pathArray.should.eql(['/','users']);
      done();
    });

    it('should be chainable', function(done) {
      combustRef = utils.newCombust();
      combustRef.child('library').child('history').child('japan');
      combustRef.pathArray.should.eql(['/', 'library', 'history', 'japan']);
      done();
    });
  });

  describe('constructPath()', function() {
    beforeEach(function(done) {
      combustRef = utils.newCombust();
      done();
    });

    it('should construct a proper path', function(done) {
      combustRef.constructPath().should.equal('/');
      combustRef.child('library');
      combustRef.constructPath().should.equal('/library/');
      combustRef.child('history');
      combustRef.constructPath().should.equal('/library/history/');
      combustRef.child('japan');
      combustRef.constructPath().should.equal('/library/history/japan/');
      done();
    });
  });
});
