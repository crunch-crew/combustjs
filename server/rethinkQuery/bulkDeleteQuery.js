var db = require('../db');
var r = require('rethinkdb');
var config = require('../config');

//is passed an object that includes a path prop and _id prop and a callback function
var bulkDeleteQuery = function(filter, input, callback) {
  db.connect(function(conn) {
    r.db(config.dbName).table(config.tableName).filter(r.row(filter).match(input)).delete().run(conn, function(err, results) {
      if (err) throw err;
      if(callback) {
        callback(results);
      }
    });
  });
};

module.exports = bulkDeleteQuery;