var r = require('../db');
var config = require('../config');
var handleError = require('./handleError');

var updateByKeyQuery = function(key, input, callback) {
  r.db(config.dbName).table(config.tableName).get(key).update(input).run()
  .then(function(result) {
    if(callback) {
      callback(result);
    }
  }).error(handleError);
};

module.exports = updateByKeyQuery;