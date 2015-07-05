var db = require('../db');
var r = require('rethinkdb');
var bubbleUp = require('../utils/bubbleUp.js');
var config = require('../config');
var parseToRows = require('../utils/parseToRows.js');
var deleteQuery = require('../rethinkQuery/deleteQuery');
var singleQuery = require('../rethinkQuery/singleQuery');
var deleteExcludeQuery = require('../rethinkQuery/deleteExcludeQuery');
var deleteAllQuery = require('../rethinkQuery/deleteAllQuery');

var deleteLogic = function(deletePath, callback) {
  // console.log('inside deletePath: ', deletePath);
  var urlArray,
      _idFind,
      parent_id,
      deleteObject,
      parent_path,
  // check to see if the deleteObject is a static property on parent level
      parentId;


  if (deletePath === '/') {
    // socket.emit(deletePath +'-deleteSuccess', {success: false});
    callback();
    return;
  } else { 
    urlArray = deletePath.split('/');
    rootString = urlArray.slice(0, urlArray.length - 2).join('/') + '/';
    parent_id_string = urlArray[urlArray.length - 3] || '/';
    parent_path = parent_id_string === '/' ? '/' : urlArray.slice(0, urlArray.length - 3).join('/') +'/';
    deleteObject = urlArray[urlArray.length - 2];
  }
  // considers the scenario that the delete path specifies the root row to be deleted
  // console.log('deletePath: ', deletePath);
  // console.log('parent_path: ', parent_path);
  // console.log('parent_id: ', parent_id);
  // console.log('deleteObject: ', deleteObject);

  if (parent_path === '/' && parent_id === '/') {
    deleteQuery({path:'/', _id: deleteObject}, function(results) {
      // socket.emit(deletePath + '-deleteSuccess', {success: true});
      // bubbleUp('value', deletePath, socket);
      callback();
    }); 
  } else if (parent_path === '/') {
    // console.log('parent_id_string: ', parent_id_string);
    singleQuery({path:'/', _id: parent_id_string}, function(array) {
      var queryResults = array[0];
      if (queryResults) {
        if (deleteObject in queryResults) {
          deleteExcludeQuery(deleteObject, function(results) {
            // socket.emit(deletePath + '-deleteSuccess', {success: true});
            // bubbleUp('value', deletePath, socket);
            callback();
          });  
        } else {
          deleteQuery({path: parent_path, _id: deleteObject}, function(results) {
            deleteAllQuery(rootString + deleteObject + '*', function(results) {
              // socket.emit(deletePath + '-deleteSuccess', {success: true});
              // bubbleUp('value', deletePath, socket);
              callback();
            });  
          });
        }
      } else{
        // console.log('NO QUERY RESULTS LINE 79');
        deleteQuery({path: parent_path, _id: deleteObject}, function(results) {
          deleteAllQuery(rootString + deleteObject + '*', function(results) {
            // socket.emit(deletePath + '-deleteSuccess', {success: true});
            // bubbleUp('value', deletePath, socket);
            callback();
          });  
        });
      }
    });
  } else {
    singleQuery({path: parent_path, _id: parent_id_string}, function(array) {
      var queryResults = array[0];
      if (queryResults) {
        if (deleteObject in queryResults) {
          deleteExcludeQuery(deleteObject, function(results) {
            // socket.emit(deletePath + '-deleteSuccess', {success: true});
            // bubbleUp('value', deletePath, socket);
            callback();
          });  
        } else {
          deleteQuery({path: rootString, _id: deleteObject}, function(results) {
            deleteAllQuery(rootString + deleteObject + '*', function() {
              // socket.emit(deletePath + '-deleteSuccess', {success: true});
              // bubbleUp('value', deletePath, socket);
              callback();
            });  
          });  
        }
      }
    });  
  }
};

module.exports = deleteLogic;
