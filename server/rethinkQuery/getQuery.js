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
    // console.log('inside getQuery input is: ', input);
    //query to find root node
    r.db(config.dbName).table(config.tableName).filter({path: rootString, _id:_idFind}).run(conn, function(err, cursor) {
      // console.log('queried for path: ', rootString);
      // console.log('queried for _id: ', _idFind);
      if (err) throw err;
      cursor.toArray(function(err, result) {
        // console.log('(rootRow)queried for path: ', rootString);
        // console.log('(rootRow)queried for _id: ', _idFind);
        // console.log('(rootRow)result is: ', result);
        rootRow = result[0];
        //first one because query returns an array, even if there is only one result
        //query to find all children of root node
        r.db(config.dbName).table(config.tableName).filter(r.row('path').match(input + '*')).run(conn, function(err, cursor) {
          if (err) throw err;
          cursor.toArray(function(err, result) {
            // console.log('(children)queried for path: ', rootString);
           // console.log('(children)queried for _id: ', _idFind);
            // console.log('(children)result is: ', result);
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
