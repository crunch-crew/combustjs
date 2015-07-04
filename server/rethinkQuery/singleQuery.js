var db = require('../db');
var r = require('rethinkdb');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var config = require('../config');

var singleQuery = function(input, callback) {
  db.connect(function(conn) {
    r.db(config.dbName).table(config.tableName).filter(input).run(conn, function(err, result) {
      if(err) throw err;
      result.toArray(function(err, array) {
        if(callback) {
          callback(array);
        }
      });
    });
  });
};

module.exports = singleQuery;