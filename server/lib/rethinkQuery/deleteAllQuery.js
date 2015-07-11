var db = require('../db');
var r = require('rethinkdb');
var config = require('../config');

var deleteAllQuery = function(path, callback) {
  db.connect(function(conn) {
    r.db(config.dbName).table(config.tableName).filter(r.row('path').match(path)).delete().run(conn, function(err, result) {
      if (err) throw err;
      if(callback) {
        callback();
      }
    });
  });
};

module.exports = deleteAllQuery;
