var r = require('../db');
var config = require('../config');
var handleError = require('./handleError');

var updateByFilterQuery = function(filter ,input, callback) {
  r.db(config.dbName).table(config.tableName).filter(filter).update(input).run()
  .then(function(result) {
    if(callback) {
      callback(result);
    }
  }).error(handleError);
};

module.exports = updateByFilterQuery;