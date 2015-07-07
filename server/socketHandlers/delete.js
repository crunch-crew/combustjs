var db = require('../db');
var r = require('rethinkdb');
var bubbleUp = require('../utils/bubbleUp.js');
var config = require('../config');
var parseToRows = require('../utils/parseToRows.js');
var deleteQuery = require('../rethinkQuery/deleteQuery');
var singleQuery = require('../rethinkQuery/singleQuery');
var deleteExcludeQuery = require('../rethinkQuery/deleteExcludeQuery');
var deleteAllQuery = require('../rethinkQuery/deleteAllQuery');
var deleteLogic = require('../utils/deleteLogic');

exports.setup = function(socket, io) {
  /**
  *@apiGroup delete
  *@apiName delete
  *@api {socket} Deletes a javascript object at the specified url
  *@api {socket} Emits back a [url]-deleteSuccess signal on success
  *@api {socket} Emits value signal to all parents AND the specified url
  *
  *@apiParam {Object} deleteSuccess An object that contains path, _id, and data as properties
  *@apiParam {String} deleteSuccess._id A string that specifies the key of the javascript object
  *
  */
  socket.on('delete', function(deleteRequest) {
    deleteLogic(deleteRequest.path, function(deleted) {
      if (deleted) {
        socket.emit(deleteRequest.path + '-deleteSuccess', {success: true});
        bubbleUp('child_removed', deleteRequest.path, io);
      }
      else {
        socket.emit(deleteRequest.path + '-deleteSuccess', {success: false});
      }
    });
  });
};
