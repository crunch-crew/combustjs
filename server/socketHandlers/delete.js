var db = require('../db');
var r = require('rethinkdb');
var bubbleUp = require('../utils/bubbleUp.js');
var config = require('../config');
var parseToRows = require('../utils/parseToRows.js');
var deleteQuery = require('../rethinkQuery/deleteQuery');
var singleQuery = require('../rethinkQuery/singleQuery');
var deleteExcludeQuery = require('../rethinkQuery/deleteExcludeQuery');
var deleteAllQuery = require('../rethinkQuery/deleteAllQuery');

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
      parent_path,
  // check to see if the deleteObject is a static property on parent level
      parentId;


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
    // considers the scenario that the delete path specifies the root row to be deleted
    if (parent_path === '/' && parent_id === '/') {
      deleteQuery({path:'/', _id: deleteObject}, function(results) {
        socket.emit(deleteRequest.path + '-deleteSuccess', {success: true});
        bubbleUp('value', deleteRequest.path, socket);
      }); 
    } else if (parent_path === '/') {
      
      singleQuery({path:'/', _id: parent_id_string}, function(results) {
        results.toArray(function(err, array) {
          if (err) throw err;
          var queryResults = array[0];
          if (queryResults) {
            if (deleteObject in queryResults) {
              deleteExcludeQuery(deleteObject, function(results) {
                socket.emit(deleteRequest.path + '-deleteSuccess', {success: true});
                bubbleUp('value', deleteRequest.path, socket);
              });  
            } else {
              deleteQuery({path: parent_path, _id: deleteObject}, function(results) {
                deleteAllQuery(rootString + deleteObject + '*', function(results) {
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
      singleQuery({path: parent_path, _id: parent_id_string}, function(results) {
        results.toArray(function(err, array) {
          if (err) throw err;
          var queryResults = array[0];
          if (queryResults) {
            if (deleteObject in queryResults) {
              deleteExcludeQuery(deleteObject, function(results) {
                socket.emit(deleteRequest.path + '-deleteSuccess', {success: true});
                bubbleUp('value', deleteRequest.path, socket);
              });  
            } else {
              deleteQuery({path: rootString, _id: deleteObject}, function(results) {
                deleteAllQuery(rootString + deleteObject + '*', function() {
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
};
