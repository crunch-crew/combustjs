var io = require('socket.io-client');
var configTest = require('../configTest')
var utils = configTest.utils;

var authenticateSocket = function(callback) {
  var agent = utils.createAgent(configTest.serverAddress);
  var that = this;
    agent.post('/signup').send(utils.authUser).expect(201).end(function(err, response) {
      if (err) throw err;
      else {
        agent.post('/authenticate').send(utils.authUser).expect(200).end(function(err, response) {
          //store the web token
          token = response.body.token;
          if (err) throw err;
          else {
            //authenticate the client with the webtoken - used for remaining tests
            socket = io.connect(configTest.serverAddress, {
              forceNew: true,
              //send the web token with the initial websocket handshake
              query: 'token=' + token
            });
            socket.on('connectSuccess', function() {
              callback(socket, agent);
            });
          }
        });
      }
    });
};

module.exports = authenticateSocket;