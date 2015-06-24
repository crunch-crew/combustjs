var db = require('../db');
var r = require('rethinkdb');
var parseToRows = require('./parseToRows');
var parseToObj = require('./parseToObj');
var config = require('../config');
// doesn't use queryType yet, can refactor later.
var dbQuery = function(queryType, request, callback) {
  //handles edge case when accessing root path
  var urlArray, rootRow, childrenRows;
  if (request.url === '/') {
    rootString = null;
    _idFind = "/";
  }
  else {
    urlArray = request.url.split('/');
    urlArray = urlArray.slice(1,urlArray.length-1);
    rootString = (urlArray.slice(0, urlArray.length-1).join("/")) + "/";
    _idFind = urlArray[urlArray.length-1];
  }
  //when queryType is get -- added this, but might not actually need.
  if(queryType === 'get') {
    //all other paths - this is just string processing to get it into the proper format for querying the db
    db.connect(function(conn) {
      //query to find root node
      r.db(config.dbName).table(config.tableName).filter({path: rootString, _id:_idFind}).run(conn, function(err, cursor) {
        if (err) throw err;
        cursor.toArray(function(err, result) {
          //first one because query returns an array, even if there is only one result
          rootRow = result[0];
        });
        //query to find all children of root node
        r.db(config.dbName).table(config.tableName).filter(r.row('path').match(request.url+"*")).run(conn, function(err, cursor) {
          if (err) throw err;
          cursor.toArray(function(err, result) {
            childrenRows = result;
            if(callback) {
              callback(parseToObj(rootRow, childrenRows));
            }
            else {
              return parseToObj(rootRow, result);
            }
          });
        });
      });
    }); 
   }

  // if(queryType === 'getChildren') {
  //   var results = [];
  //   r.db(config.dbName).table(config.tableName).filter({path: rootString, _idFind}).run(conn, function(err, cursor) {
  //     cursor.toArray(function(err, result) {
  //       for(var key in result[0]) {
  //         if(key !== "path" && key !== "_id" && key !== "id" && key !== "_length" && key !== "_isArray" && key !== "_partArray") {
            
  //         }
  //       }
  //     });
  //     r.db(config.dbName).table(config.tableName).filter(r.row('path').match(request.url+"*/")).run(conn, function(err, cursor) {
  //         if (err) throw err;
  //           cursor.toArray(function(err, result) {
  //             childrenRows = result;
  //           childrenRows.forEach(function(row) {
  //             results.push(parseToObj({}, row));
  //           });
  //           if(callback) {
  //             callback(results);
  //           }
  //           else {
  //             return results;
  //           }
  //         });
  //     });
  //   });
  // }

};
module.exports = dbQuery;