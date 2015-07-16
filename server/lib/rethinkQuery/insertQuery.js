var r = require('../db');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var config = require('../config');
var updateByFilter = require('./updateByFilterQuery');
var handleError = require('./handleError');

var insertQuery = function(input, callback) {
  //handles empty object case
  if (Object.keys(input).length === 0) {
    r.db(config.dbName).table(config.tableName).insert(input).run()
    .then(function(result) {
      if(callback) {
        callback(result);
      }
    }).error(handleError);
  }
  else {
    //convert to array if not array
    if (!(input instanceof Array)) {
      input = [input];
    }
      var counter = 0;
      var limit = input.length;
      input.forEach(function(row) {
        var rowFilter;
        if (row.path) {
          rowFilter = {path: row.path, _id: row._id};
        }
        else {
          rowFilter = {_id: row._id};
        }
        r.db(config.dbName).table(config.tableName).filter(rowFilter).run().then(function(result) {
          if (result.length === 0) {
            r.db(config.dbName).table(config.tableName).insert(row).run().then(function(result) {
              counter++;
              if(callback && counter === limit) {
                callback(result);
              }
            }).error(handleError);
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
  }
};

module.exports = insertQuery;