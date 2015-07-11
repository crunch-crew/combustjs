var db = require('../db');
var r = require('rethinkdb');
var config = require('../config');

//is passed an object that includes a path prop and _id prop and a callback function
var deleteQuery = function(path, callback) {
  db.connect(function(conn) {
    r.db(config.dbName).table(config.tableName).filter(path).delete().run(conn, function(err, results) {
      if (err) throw err;
      if(callback) {
        callback(results);
      }
    });
  });
};

module.exports = deleteQuery;