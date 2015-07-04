var db = require('../db');
var r = require('rethinkdb');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var config = require('../config');

var insertQuery = function(input, callback) {
  db.connect(function(conn) {
    r.db(config.dbName).table(config.tableName).insert(input).run(conn, function(err, result) {
      if(err) throw err;
      // console.log('results of insert:', result);
      if(callback) {
        callback(result);
      }
    });
  });
};

module.exports = insertQuery;