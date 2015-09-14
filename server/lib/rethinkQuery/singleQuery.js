var r = require('../db');
var parseToRows = require('../utils/parseToRows');
var parseToObj = require('../utils/parseToObj');
var config = require('../config');
var handleError = require('./handleError');

var singleQuery = function(input, callback) {
  r.db(config.dbName).table(config.tableName).filter(input).run()
  .then(function(result) {
    if(callback) {
      callback(result);
    }
  }).error(handleError);
};

module.exports = singleQuery;