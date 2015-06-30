var db = require('../db');
var r = require('rethinkdb');
var config = require('../config');

var updateByFilterQuery = function(filter ,input, callback) {
  db.connect(function(conn) {
    r.db(config.dbName).table(config.tableName).filter(filter).update(input).run(conn, function(err, result) {
      if(err) throw err;

      if(callback) {
        callback(result);
      }
    });
  });
};

module.exports = updateByFilterQuery;