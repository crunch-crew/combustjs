var db = require('../db');
var r = require('rethinkdb');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var config = require('../config');
var updateByFilter = require('./updateByFilterQuery');

var insertQuery = function(input, callback) {
  //handles empty object case
  if (Object.keys(input).length === 0) {
    db.connect(function(conn) {
      r.db(config.dbName).table(config.tableName).insert(input).run(conn, function(err, result) {
        if(err) throw err;
        if(callback) {
          callback(result);
        }
      });
    });
  }
  else {
    //convert to array if not array
    if (!(input instanceof Array)) {
      input = [input];
    }
    db.connect(function(conn) {
      var counter = 0;
      var limit = input.length;
      input.forEach(function(row) {
        // console.log('inside insertQuery, row is: ', row);
        var rowFilter;
        if (row.path) {
          rowFilter = {path: row.path, _id: row._id};
        }
        else {
          rowFilter = {_id: row._id};
        }
        r.db(config.dbName).table(config.tableName).filter(rowFilter).run(conn, function(err, result) {
          if (err) throw err;
          result.toArray(function(err, array) {
            if (err) throw err;
            if (array.length === 0) {
              r.db(config.dbName).table(config.tableName).insert(row).run(conn, function(err, result) {
                // console.log('inserted: ', row);
                if(err) throw err;
                counter++;
                if(callback && counter === limit) {
                  callback(result);
                }
              });
            }
            else {
              updateByFilter(rowFilter, row, function() {
                counter++;
                if(callback && counter === limit) {
                  callback(result);
                }
              });
            }
          });
        });
      });
    });
  }
};

module.exports = insertQuery;