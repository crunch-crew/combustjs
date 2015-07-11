var configTest = require('../configTest');
var utils = require('../configTest').utils;
var supertest = require('supertest');

var authenticateAgent = function(callback, credentials) {
  agent = utils.createAgent(configTest.serverAddress);
  credentials = credentials || utils.testUser;
  agent.post('/signup').send(credentials).end(function(err, response) {
    if (err) throw err;
    else {
      agent.post('/authenticate').send(credentials).end(function(err, response) {
        userId = response.body.id;
        if (err) throw err;
        else {
          callback(response.body.token, agent);
        }
      });
    }
  });
}

module.exports = authenticateAgent;