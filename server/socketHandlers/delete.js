var db = require('../db');
var r = require('rethinkdb');
var bubbleUp = require('../utils/bubbleUp.js');
var config = require('../config');
var parseToRows = require('../utils/parseToRows.js');
var _ = require('underscore');

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
    var urlArray,
        _idFind,
        parent_id,
        deleteObject,
        parent_path;

    if (deleteRequest.path === '/') {
      socket.emit(deleteRequest.path +'-deleteSuccess', {success: false});
      return;
    } else { 
      urlArray = deleteRequest.path.split('/');
      rootString = urlArray.slice(0, urlArray.length - 2).join('/') + '/';
      parent_id_string = urlArray[urlArray.length - 3] || '/';
      parent_path = parent_id_string === '/' ? '/' : urlArray.slice(0, urlArray.length - 3).join('/') +'/';
    deleteObject = urlArray[urlArray.length - 2];
    }
    // check to see if the deleteObject is a static property on parent level
    var parentId;
    db.connect(function(conn) {
      // considers the senario that the delete path specifies the root row to be deleted
      if (parent_path === '/' && parent_id === '/') {
        r.db(config.dbName).table(config.tableName).filter({path: '/', _id: deleteObject}).delete().run(conn, function(err, results) {
          if (err) throw err;
          socket.emit(deleteRequest.path + '-deleteSuccess', {success: true});
          bubbleUp('value', deleteRequest.path, socket);
        });
      } else if (parent_path === '/') {
       
          r.db(config.dbName).table(config.tableName).filter({path: '/', _id: parent_id_string}).run(conn, function(err, results) {
          if (err) throw err;
          results.toArray(function(err, array) {
            if (err) throw err;
            var queryResults = array[0];
            if (queryResults) {
              if (deleteObject in queryResults) {
                r.db(config.dbName).table(config.tableName).replace(r.row.without(deleteObject)).run(conn, function(err, results) {
                  if (err) throw err;
                  socket.emit(deleteRequest.path + '-deleteSuccess', {success: true});
                  bubbleUp('value', deleteRequest.path, socket);
                });
              } else {
                r.db(config.dbName).table(config.tableName).filter({path: parent_path, _id: deleteObject}).delete().run(conn, function(err, results) {
                  if (err) throw err;
                  r.db(config.dbName).table(config.tableName).filter(r.row('path').match(rootString + deleteObject + "*")).delete().run(conn, function(err, results) {
                    if (err) throw err;
                    socket.emit(deleteRequest.path + '-deleteSuccess', {success: true});
                    bubbleUp('value', deleteRequest.path, socket);
                  });
                });
              }
            } else{
              console.log('NO QUERY RESULTS LINE 79');
            }
          });
        });
      } else {
        r.db(config.dbName).table(config.tableName).filter({path: parent_path, _id: parent_id_string}).run(conn, function(err, results) {
          if (err) throw err;
          results.toArray(function(err, array) {
            if (err) throw err;
            var queryResults = array[0];
            if (queryResults) {
              if (deleteObject in queryResults) {
                r.db(config.dbName).table(config.tableName).replace(r.row.without(deleteObject)).run(conn, function(err, results) {
                  if (err) throw err;
                  socket.emit(deleteRequest.path + '-deleteSuccess', {success: true});
                  bubbleUp('value', deleteRequest.path, socket);
                 
                });
              } else {
               r.db(config.dbName).table(config.tableName).filter({path: rootString, _id: deleteObject}).delete().run(conn, function(err, results) {
                  if (err) throw err;
                  r.db(config.dbName).table(config.tableName).filter(r.row('path').match(rootString + deleteObject + "*")).delete().run(conn, function(err, results) {
                    if (err) throw err;
                    socket.emit(deleteRequest.path + '-deleteSuccess', {success: true});
                    bubbleUp('value', deleteRequest.path, socket);
                  });
                });
              }
            }
          });
        });
      }
    });
  });
};