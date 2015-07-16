var r = require('../db');
var config = require('../config');
var handleError = require('./handleError');

var deleteAllQuery = function(path, callback) {
  r.db(config.dbName).table(config.tableName).filter(r.row('path').match(path)).delete().run()
  .then(function(result) {
    if(callback) {
      //should this pass result as a parameter?
      callback();
    }
  })
  .error(handleError);
};

module.exports = deleteAllQuery;
