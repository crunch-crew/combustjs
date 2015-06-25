var db = require('../db');
var r = require('rethinkdb');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var config = require('../config');
var rules = require('../authorization');
var checkPermissions = require('../utils/checkPermissions');

exports.setup = function(socket, io) {
  socket.on('evalTest', function(evalRequest) {
    if (checkPermissions(evalRequest.path).write) {
      console.log("Permission granted!");
    }
    else {
      console.log("Permission denied!");
    }
  });
}