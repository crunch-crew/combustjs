var db = require('../db');
var r = require('rethinkdb');
var config = require('../config');
var parseToObj = require('../utils/parseToObj');
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
