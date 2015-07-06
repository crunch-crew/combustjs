var db = require('../db');
var r = require('rethinkdb');
var config = require('../config');
var parseToObj = require('../utils/parseToObj');
var getParent = require('../utils/getParent');
var getLastKey = require('../utils/getLastKey');
// var parseToRows = require('../utils/parseToRows');

var getQuery = function(input, callback) {
  //handles edge case when accessing root path
  var urlArray;
  if (input === '/') {
    rootString = null;
    _idFind = "/";
  }
  //all other paths - this is just string processing to get it into the proper format for querying the db
  else {
    urlArray = input.split('/');
    urlArray = urlArray.slice(0,urlArray.length-1);
    rootString = (urlArray.slice(0, urlArray.length-1).join("/")) + "/";
    _idFind = urlArray[urlArray.length-1];
  }
  var rootRow;
  var childrenRows;

  db.connect(function(conn) {
    if (input !== '/') {
      var parentPath;
      var parentId;
      var key = getLastKey(input);
      //root edge case
      if (getParent(input) === '/') {
        parentPath = null;
        parentId = '/';
      }
      //string processing to query for parent node - need path of grandparent and id of parent
      else {
        parentPath = getParent(getParent(input));
        parentId = getParent(input);
      }
      //query to find parent node - check if static property
      r.db(config.dbName).table(config.tableName).filter({path: parentPath, _id: parentId}).run(conn, function(err, cursor) {
        if (err) throw err;
        cursor.toArray(function(err, result) {
          if (result[0] && key in result[0]) {
            if (callback) {
              callback(result[0][key]);
            }
            //if path is a static property, it will return the value and terminate the function, otherwise will continue looking for it as a non-static property
            return;
          }
        });
      });
    }
    //query to find root node
    r.db(config.dbName).table(config.tableName).filter({path: rootString, _id:_idFind}).run(conn, function(err, cursor) {
      if (err) throw err;
      cursor.toArray(function(err, result) {
        //first one because query returns an array, even if there is only one result
        rootRow = result[0];
        //query to find all children of root node
        r.db(config.dbName).table(config.tableName).filter(r.row('path').match(input + '*')).run(conn, function(err, cursor) {
          if (err) throw err;
          cursor.toArray(function(err, result) {
            childrenRows = result;
            if(callback) {
              callback(parseToObj(rootRow, childrenRows));
            }
          });
        });
      });
    }); 
  });
};

module.exports = getQuery;
