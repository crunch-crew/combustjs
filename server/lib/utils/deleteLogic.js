var bubbleUp = require('../utils/bubbleUp.js');
var config = require('../config');
var parseToRows = require('../utils/parseToRows.js');
var deleteQuery = require('../rethinkQuery/deleteQuery');
var singleQuery = require('../rethinkQuery/singleQuery');
var deleteExcludeQuery = require('../rethinkQuery/deleteExcludeQuery');
var deleteAllQuery = require('../rethinkQuery/deleteAllQuery');
var getParent = require('./getParent');
var getLastKey = require('./getLastKey');

var deleteLogic = function(deletePath, callback) {
  var urlArray,
      _idFind,
      parent_id,
      deleteObject,
      parent_path,
      // check to see if the deleteObject is a static property on parent level
      parentId;


  if (deletePath === '/') {
    callback(false);
    return;
  } else { 
    urlArray = deletePath.split('/');
    rootString = urlArray.slice(0, urlArray.length - 2).join('/') + '/';
    parent_id_string = urlArray[urlArray.length - 3] || '/';
    parent_path = parent_id_string === '/' ? '/' : urlArray.slice(0, urlArray.length - 3).join('/') +'/';
    deleteObject = urlArray[urlArray.length - 2];
  }

  if (parent_path === '/' && parent_id === '/') {
    deleteQuery({path:'/', _id: deleteObject}, function(results) {
      callback(true);
    }); 
  } else if (parent_path === '/') {
    singleQuery({path:'/', _id: parent_id_string}, function(array) {
      var queryResults = array[0];
      if (queryResults) {
        if (deleteObject in queryResults) {
          deleteExcludeQuery(deleteObject, function(results) {
            callback(true);
          });  
        } else {
          deleteQuery({path: rootString, _id: deleteObject}, function(results) {
            deleteAllQuery(rootString + deleteObject + '*', function(results) {
              callback(true);
            });  
          });
        }
      } else {
        deleteQuery({path: parent_path, _id: deleteObject}, function(results) {
          deleteAllQuery(rootString + deleteObject + '*', function(results) {
            callback(true);
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
            callback(true);
          });  
        } else {
          deleteQuery({path: rootString, _id: deleteObject}, function(results) {
            deleteAllQuery(rootString + deleteObject + '*', function() {
              callback(true);
            });  
          });  
        }
      }
    });  
  }
};

module.exports = deleteLogic;
