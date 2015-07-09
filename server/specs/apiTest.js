var should = require('should');
var supertest = require('supertest');
var configTest = require('./configTest');
var authenticateAgent = require('./utils/authenticateAgent');
var resetDb = require('./utils/resetDb');
var bulkInsert = require('./utils/bulkInsert');

var utils = configTest.utils;
var serverAddress = configTest.serverAddress;

describe('authorization', function() {
  var agent;
  var token;
  beforeEach(function(done) {
    resetDb(function() {
      authenticateAgent(function(token, authenticatedAgent) {
        token = token;
        agent = authenticatedAgent;
        done();
      });
    });
  });

  after(function(done) {
    resetDb(function() {
      done();
    });
  });

  describe('GET', function() {
    var testObj = {this: {is: {even: {more: {nested: true}}}}};
    it('should retrieve JSON for a path to a nested object', function(done) {
      bulkInsert('/test/', testObj, function() {
        agent.get('/api/test/').send().expect(200).end(function(err, response) {
          response.body.should.eql(testObj);
          done();
        });
      });
    });

    it('should retrieve JSON for a path to a static property', function(done) {
      bulkInsert('/test/', testObj, function() {
        agent.get('/api/test/this/is/even/more/nested/').send().expect(200).end(function(err, response) {
          response.body.should.eql(testObj.this.is.even.more.nested);
          done();
        });
      });
    });
  });
});