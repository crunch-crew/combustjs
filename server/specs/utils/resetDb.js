var r = require('rethinkdb');
var db = require('../../db');
var utils = require('../configTest').utils;

var resetDb = function(callback) {
  db.connect(function(conn) {
    r.db(utils.dbName).table(utils.tableName).delete().run(conn, function(err, cursor) {
      if (err) throw err;
      r.db(utils.dbName).table(utils.tableName).insert({path: null, _id: '/'}).run(conn, function(err, cursor) {
        r.db(utils.dbName).table(utils.tableName).insert({path: '/', _id: 'users'}).run(conn, function(err, cursor) {
          if (err) throw (err);
          callback();
        });
      });
    });
  });
}

module.exports = resetDb;