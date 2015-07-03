var db = require('../db');
var r = require('rethinkdb');
var config = require('../config');

var deleteAllQuery = function(input, callback) {
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
  db.connect(function(conn) {
    //query to find root node
    r.db(config.dbName).table(config.tableName).filter({path: rootString, _id:_idFind}).delete().run(conn, function(err, result) {
      if (err) throw err;
      r.db(config.dbName).table(config.tableName).filter(r.row('path').match(input + '*')).delete().run(conn, function(err, result) {
        if (err) throw err;
        if(callback) {
          callback();
        }
      });
    }); 
  });
};

module.exports = deleteAllQuery;
