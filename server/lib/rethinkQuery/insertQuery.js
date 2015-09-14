var r = require('../db');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var config = require('../config');
var updateByFilter = require('./updateByFilterQuery');
var handleError = require('./handleError');
var Promise = require('bluebird');

var insertQuery = Promise.coroutine(function* (input, callback) {
  var result;
  //handles empty object case
  if (Object.keys(input).length === 0) {
    result = yield r.db(config.dbName).table(config.tableName).insert(input).run();
    if(callback) {
      callback(result);
    }
  }
  else {
    //convert to array if not array
    if (!(input instanceof Array)) {
      input = [input];
    }
    var counter = 0;
    var limit = input.length;
    for (var i = 0; i < input.length; i++) {
      var row = input[i];
      var rowFilter;
      if (row.path) {
        rowFilter = {path: row.path, _id: row._id};
      }
      else {
        rowFilter = {_id: row._id};
      }

      result = yield r.db(config.dbName).table(config.tableName).filter(rowFilter).run();
      if (result.length === 0) {
        result = yield r.db(config.dbName).table(config.tableName).insert(row).run();
        counter++;
        if(callback && counter === limit) {
          callback(result);
        }
      }
      else {
        updateByFilter(rowFilter, row, function() {
          counter++;
          if(callback && counter === limit) {
            callback(result);
          }
        });
      }
    }
  };
});

module.exports = insertQuery; 